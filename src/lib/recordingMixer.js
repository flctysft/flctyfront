import { computeTileRects } from './gridLayout.js'

const CANVAS_WIDTH = 1280
const CANVAS_HEIGHT = 720
const FRAME_RATE = 30
const VIDEO_BITS_PER_SECOND = 1_500_000

const CANDIDATE_MIME_TYPES = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']

function pickMimeType() {
  return CANDIDATE_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) || 'video/webm'
}

// Draws `videoEl`'s frame into `rect` on `ctx`, cropping to preserve aspect
// ratio (equivalent to CSS `object-fit: cover`).
function drawCover(ctx, videoEl, rect) {
  const videoWidth = videoEl.videoWidth
  const videoHeight = videoEl.videoHeight
  if (!videoWidth || !videoHeight) return

  const videoRatio = videoWidth / videoHeight
  const rectRatio = rect.width / rect.height

  let sx = 0
  let sy = 0
  let sWidth = videoWidth
  let sHeight = videoHeight

  if (videoRatio > rectRatio) {
    sWidth = videoHeight * rectRatio
    sx = (videoWidth - sWidth) / 2
  } else {
    sHeight = videoWidth / rectRatio
    sy = (videoHeight - sHeight) / 2
  }

  ctx.drawImage(videoEl, sx, sy, sWidth, sHeight, rect.x, rect.y, rect.width, rect.height)
}

// Client-side composite call recorder: draws every visible tile onto a
// hidden canvas, mixes all participants' audio via the Web Audio API, and
// records the combined stream with MediaRecorder. Used because the backend
// has no media server (SFU) to do server-side mixing.
export function createCompositeRecorder() {
  const videoElements = new Map()
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT
  const ctx = canvas.getContext('2d')

  let audioContext = null
  let audioDestination = null
  const audioSources = new Map()

  let rafId = null
  let mediaRecorder = null
  let chunks = []

  function setStreams(streamsMap) {
    for (const [key, stream] of streamsMap.entries()) {
      if (videoElements.has(key)) continue
      const videoEl = document.createElement('video')
      videoEl.muted = true
      videoEl.playsInline = true
      videoEl.srcObject = stream
      videoEl.play().catch(() => {})
      videoElements.set(key, videoEl)

      if (audioContext && stream.getAudioTracks().length) {
        try {
          const source = audioContext.createMediaStreamSource(stream)
          source.connect(audioDestination)
          audioSources.set(key, source)
        } catch {
          // ignore streams that can't be connected (e.g. already closed)
        }
      }
    }

    for (const key of [...videoElements.keys()]) {
      if (!streamsMap.has(key)) {
        videoElements.get(key).srcObject = null
        videoElements.delete(key)
        audioSources.get(key)?.disconnect()
        audioSources.delete(key)
      }
    }
  }

  function drawFrame() {
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const keys = [...videoElements.keys()]
    const rects = computeTileRects(keys.length, canvas.width, canvas.height)
    keys.forEach((key, index) => {
      const rect = rects[index]
      if (rect) drawCover(ctx, videoElements.get(key), rect)
    })

    rafId = requestAnimationFrame(drawFrame)
  }

  async function start() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    audioDestination = audioContext.createMediaStreamDestination()

    for (const [key, videoEl] of videoElements.entries()) {
      const stream = videoEl.srcObject
      if (stream?.getAudioTracks().length) {
        try {
          const source = audioContext.createMediaStreamSource(stream)
          source.connect(audioDestination)
          audioSources.set(key, source)
        } catch {
          // ignore
        }
      }
    }

    rafId = requestAnimationFrame(drawFrame)

    const canvasStream = canvas.captureStream(FRAME_RATE)
    const combined = new MediaStream([...canvasStream.getVideoTracks(), ...audioDestination.stream.getAudioTracks()])

    const mimeType = pickMimeType()
    chunks = []
    mediaRecorder = new MediaRecorder(combined, { mimeType, videoBitsPerSecond: VIDEO_BITS_PER_SECOND })
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunks.push(event.data)
    }
    mediaRecorder.start(1000)
  }

  function stop() {
    return new Promise((resolve, reject) => {
      if (!mediaRecorder) {
        reject(new Error('Recording was not started'))
        return
      }
      mediaRecorder.onstop = () => {
        cancelAnimationFrame(rafId)
        rafId = null
        const mimeType = mediaRecorder.mimeType || pickMimeType()
        const blob = new Blob(chunks, { type: mimeType })
        chunks = []

        videoElements.forEach((videoEl) => {
          videoEl.srcObject = null
        })
        videoElements.clear()
        audioSources.forEach((source) => source.disconnect())
        audioSources.clear()
        audioContext?.close().catch(() => {})
        audioContext = null
        audioDestination = null
        mediaRecorder = null

        resolve(blob)
      }
      mediaRecorder.stop()
    })
  }

  return { setStreams, start, stop }
}
