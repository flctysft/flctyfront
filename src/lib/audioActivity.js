import { useEffect, useRef, useState } from 'react'

const SPEAKING_THRESHOLD = 0.06
const HYSTERESIS_FRAMES = 6

// Detects which streams currently have audible audio, so the UI can
// highlight whoever is speaking (Zoom-style active-speaker ring).
export function useActiveSpeakers(streamsMap) {
  const [speakingIds, setSpeakingIds] = useState(new Set())
  const audioContextRef = useRef(null)
  const analysersRef = useRef(new Map())
  const belowThresholdCountRef = useRef(new Map())
  const rafRef = useRef(null)

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    const audioContext = audioContextRef.current

    for (const [id, stream] of streamsMap.entries()) {
      if (analysersRef.current.has(id)) continue
      if (!stream?.getAudioTracks().length) continue
      try {
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 512
        source.connect(analyser)
        analysersRef.current.set(id, { analyser, data: new Uint8Array(analyser.frequencyBinCount) })
      } catch {
        // stream not analysable (e.g. already closed) - skip
      }
    }

    for (const id of [...analysersRef.current.keys()]) {
      if (!streamsMap.has(id)) {
        analysersRef.current.delete(id)
        belowThresholdCountRef.current.delete(id)
      }
    }

    return undefined
  }, [streamsMap])

  useEffect(() => {
    function tick() {
      const nextSpeaking = new Set()
      for (const [id, { analyser, data }] of analysersRef.current.entries()) {
        analyser.getByteTimeDomainData(data)
        let sumSquares = 0
        for (let i = 0; i < data.length; i += 1) {
          const normalized = (data[i] - 128) / 128
          sumSquares += normalized * normalized
        }
        const rms = Math.sqrt(sumSquares / data.length)

        if (rms > SPEAKING_THRESHOLD) {
          belowThresholdCountRef.current.set(id, 0)
          nextSpeaking.add(id)
        } else {
          const count = (belowThresholdCountRef.current.get(id) || 0) + 1
          belowThresholdCountRef.current.set(id, count)
          if (count < HYSTERESIS_FRAMES) nextSpeaking.add(id)
        }
      }

      setSpeakingIds((prev) => {
        if (prev.size === nextSpeaking.size && [...prev].every((id) => nextSpeaking.has(id))) return prev
        return nextSpeaking
      })
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  useEffect(() => {
    return () => {
      audioContextRef.current?.close().catch(() => {})
    }
  }, [])

  return speakingIds
}
