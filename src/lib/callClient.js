import { useCallback, useEffect, useRef, useState } from 'react'
import api from './api.js'
import { createCompositeRecorder } from './recordingMixer.js'

function wsBaseUrl() {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
  return apiBase.replace(/^http/, 'ws').replace(/\/api\/?$/, '')
}

export function useCallRoom(token, interviewId) {
  const [localStream, setLocalStream] = useState(null)
  const [remoteStreams, setRemoteStreams] = useState(new Map())
  const [participants, setParticipants] = useState(new Map())
  const [connectionState, setConnectionState] = useState('connecting')
  const [error, setError] = useState('')
  const [micEnabled, setMicEnabled] = useState(true)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [events, setEvents] = useState([])
  const [isModerator, setIsModerator] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [screenShareStream, setScreenShareStream] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingOwnerName, setRecordingOwnerName] = useState(null)

  const wsRef = useRef(null)
  const peersRef = useRef(new Map())
  const localStreamRef = useRef(null)
  const iceServersRef = useRef([])
  const selfIdRef = useRef(null)
  const participantsRef = useRef(new Map())
  const intentionalCloseRef = useRef(false)
  const screenStreamRef = useRef(null)
  const isScreenSharingRef = useRef(false)
  const recorderRef = useRef(null)
  const eventIdRef = useRef(0)

  function send(message) {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }

  function pushEvent(text) {
    const id = ++eventIdRef.current
    setEvents((prev) => [...prev, { id, text }])
  }

  function dismissEvent(id) {
    setEvents((prev) => prev.filter((event) => event.id !== id))
  }

  const cleanup = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
    peersRef.current.forEach((entry) => entry.pc.close())
    peersRef.current.clear()
    localStreamRef.current?.getTracks().forEach((track) => track.stop())
    localStreamRef.current = null
    screenStreamRef.current?.getTracks().forEach((track) => track.stop())
    screenStreamRef.current = null
    isScreenSharingRef.current = false
    if (recorderRef.current) {
      recorderRef.current.stop().catch(() => {})
      recorderRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!token) return
    let cancelled = false

    function getOrCreatePeer(peerId) {
      let entry = peersRef.current.get(peerId)
      if (entry) return entry

      const pc = new RTCPeerConnection({ iceServers: iceServersRef.current })
      entry = { pc, polite: selfIdRef.current > peerId, makingOffer: false, ignoreOffer: false }
      peersRef.current.set(peerId, entry)

      localStreamRef.current?.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current))

      if (isScreenSharingRef.current && screenStreamRef.current) {
        const screenTrack = screenStreamRef.current.getVideoTracks()[0]
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
        if (screenTrack && sender) sender.replaceTrack(screenTrack)
      }

      pc.ontrack = (event) => {
        setRemoteStreams((prev) => {
          const next = new Map(prev)
          next.set(peerId, event.streams[0])
          return next
        })
      }

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) send({ type: 'ice-candidate', to: peerId, payload: candidate })
      }

      pc.onnegotiationneeded = async () => {
        try {
          entry.makingOffer = true
          await pc.setLocalDescription()
          send({ type: 'offer', to: peerId, payload: pc.localDescription })
        } catch (err) {
          console.error('Failed to negotiate call connection', err)
        } finally {
          entry.makingOffer = false
        }
      }

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'failed') pc.restartIce()
      }

      return entry
    }

    function removePeer(peerId) {
      const entry = peersRef.current.get(peerId)
      entry?.pc.close()
      peersRef.current.delete(peerId)
      setRemoteStreams((prev) => {
        const next = new Map(prev)
        next.delete(peerId)
        return next
      })
    }

    function resolveParticipantName(participantId) {
      if (participantId === selfIdRef.current) return 'You'
      return participantsRef.current.get(participantId)?.name || 'Someone'
    }

    function updateParticipant(participantId, patch) {
      const existing = participantsRef.current.get(participantId)
      if (!existing) return
      const next = new Map(participantsRef.current)
      next.set(participantId, { ...existing, ...patch })
      participantsRef.current = next
      setParticipants(next)
    }

    async function handleDescription(peerId, description) {
      const entry = getOrCreatePeer(peerId)
      const { pc } = entry
      const offerCollision = description.type === 'offer' && (entry.makingOffer || pc.signalingState !== 'stable')
      entry.ignoreOffer = !entry.polite && offerCollision
      if (entry.ignoreOffer) return

      await pc.setRemoteDescription(description)
      if (description.type === 'offer') {
        await pc.setLocalDescription()
        send({ type: 'answer', to: peerId, payload: pc.localDescription })
      }
    }

    async function handleCandidate(peerId, candidate) {
      const entry = peersRef.current.get(peerId)
      if (!entry) return
      try {
        await entry.pc.addIceCandidate(candidate)
      } catch (err) {
        if (!entry.ignoreOffer) console.error('Failed to add ICE candidate', err)
      }
    }

    function handleSignal(message) {
      switch (message.type) {
        case 'room-state': {
          selfIdRef.current = message.selfId
          iceServersRef.current = message.iceServers || []
          setIsModerator(Boolean(message.moderator))
          const peerMap = new Map()
          for (const peer of message.peers || []) {
            peerMap.set(peer.id, { name: peer.name, moderator: peer.moderator, sharingScreen: false })
            getOrCreatePeer(peer.id)
          }
          participantsRef.current = peerMap
          setParticipants(peerMap)
          break
        }
        case 'peer-joined': {
          const next = new Map(participantsRef.current)
          next.set(message.id, { name: message.name, moderator: message.moderator, sharingScreen: false })
          participantsRef.current = next
          setParticipants(next)
          getOrCreatePeer(message.id)
          pushEvent(`${message.name} joined the call`)
          if (isScreenSharingRef.current) send({ type: 'screen-share-start' })
          break
        }
        case 'peer-left': {
          const name = participantsRef.current.get(message.id)?.name || message.name || 'Someone'
          removePeer(message.id)
          const next = new Map(participantsRef.current)
          next.delete(message.id)
          participantsRef.current = next
          setParticipants(next)
          pushEvent(`${name} left the call`)
          break
        }
        case 'screen-share-start':
          updateParticipant(message.from, { sharingScreen: true })
          break
        case 'screen-share-stop':
          updateParticipant(message.from, { sharingScreen: false })
          break
        case 'recording-started':
          setIsRecording(true)
          setRecordingOwnerName(resolveParticipantName(message.from))
          pushEvent('Recording started')
          break
        case 'recording-stopped':
          setIsRecording(false)
          setRecordingOwnerName(null)
          pushEvent('Recording stopped')
          break
        case 'offer':
        case 'answer':
          handleDescription(message.from, message.payload)
          break
        case 'ice-candidate':
          handleCandidate(message.from, message.payload)
          break
        default:
          break
      }
    }

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        localStreamRef.current = stream
        setLocalStream(stream)
      } catch {
        if (!cancelled) {
          setError('Camera/microphone access was denied. Please allow access and rejoin.')
          setConnectionState('error')
        }
        return
      }

      const ws = new WebSocket(`${wsBaseUrl()}/ws/calls?token=${encodeURIComponent(token)}`)
      wsRef.current = ws
      ws.onopen = () => setConnectionState('connected')
      ws.onclose = () => {
        setConnectionState((prev) => {
          if (prev === 'error') return prev
          return intentionalCloseRef.current ? 'closed' : 'disconnected'
        })
      }
      ws.onerror = () => {
        setError('Lost connection to the call server.')
        setConnectionState('error')
      }
      ws.onmessage = (event) => handleSignal(JSON.parse(event.data))
    }

    start()
    window.addEventListener('beforeunload', cleanup)

    return () => {
      cancelled = true
      window.removeEventListener('beforeunload', cleanup)
      cleanup()
    }
  }, [token, cleanup])

  useEffect(() => {
    if (!isRecording || !recorderRef.current) return
    const streamsMap = new Map()
    if (localStreamRef.current) streamsMap.set('self', screenShareStream || localStreamRef.current)
    remoteStreams.forEach((stream, peerId) => streamsMap.set(peerId, stream))
    recorderRef.current.setStreams(streamsMap)
  }, [isRecording, remoteStreams, screenShareStream, localStream])

  function toggleMic() {
    const tracks = localStreamRef.current?.getAudioTracks() || []
    const nextEnabled = !micEnabled
    tracks.forEach((track) => {
      track.enabled = nextEnabled
    })
    setMicEnabled(nextEnabled)
  }

  function toggleCamera() {
    const tracks = localStreamRef.current?.getVideoTracks() || []
    const nextEnabled = !cameraEnabled
    tracks.forEach((track) => {
      track.enabled = nextEnabled
    })
    setCameraEnabled(nextEnabled)
  }

  async function startScreenShare() {
    if (isScreenSharingRef.current) return
    let stream
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
    } catch {
      return
    }
    const screenTrack = stream.getVideoTracks()[0]
    screenStreamRef.current = stream
    isScreenSharingRef.current = true
    setIsScreenSharing(true)
    setScreenShareStream(stream)

    peersRef.current.forEach((entry) => {
      const sender = entry.pc.getSenders().find((s) => s.track?.kind === 'video')
      sender?.replaceTrack(screenTrack)
    })

    screenTrack.onended = () => stopScreenShare()
    send({ type: 'screen-share-start' })
  }

  function stopScreenShare() {
    if (!isScreenSharingRef.current) return
    const cameraTrack = localStreamRef.current?.getVideoTracks()[0] || null
    peersRef.current.forEach((entry) => {
      const sender = entry.pc.getSenders().find((s) => s.track?.kind === 'video')
      sender?.replaceTrack(cameraTrack)
    })
    screenStreamRef.current?.getTracks().forEach((track) => track.stop())
    screenStreamRef.current = null
    isScreenSharingRef.current = false
    setIsScreenSharing(false)
    setScreenShareStream(null)
    send({ type: 'screen-share-stop' })
  }

  function toggleScreenShare() {
    if (isScreenSharing) {
      stopScreenShare()
    } else {
      startScreenShare()
    }
  }

  async function startRecording() {
    if (!isModerator || isRecording) return
    const mixer = createCompositeRecorder()
    const streamsMap = new Map()
    if (localStreamRef.current) streamsMap.set('self', screenShareStream || localStreamRef.current)
    remoteStreams.forEach((stream, peerId) => streamsMap.set(peerId, stream))
    mixer.setStreams(streamsMap)
    try {
      await mixer.start()
    } catch (err) {
      console.error('Failed to start recording', err)
      return
    }
    recorderRef.current = mixer
    setIsRecording(true)
    setRecordingOwnerName('You')
    send({ type: 'recording-started' })
  }

  async function stopRecording() {
    const mixer = recorderRef.current
    if (!mixer) return
    recorderRef.current = null
    const blob = await mixer.stop()
    setIsRecording(false)
    setRecordingOwnerName(null)
    send({ type: 'recording-stopped' })

    if (interviewId) {
      const formData = new FormData()
      formData.append('file', blob, `interview-${interviewId}-${Date.now()}.webm`)
      try {
        await api.post(`/employer/interviews/${interviewId}/recordings`, formData)
      } catch (err) {
        console.error('Failed to upload recording', err)
      }
    }
  }

  const leave = useCallback(() => {
    intentionalCloseRef.current = true
    cleanup()
    setConnectionState('closed')
  }, [cleanup])

  return {
    localStream,
    remoteStreams,
    participants,
    connectionState,
    error,
    micEnabled,
    cameraEnabled,
    toggleMic,
    toggleCamera,
    events,
    dismissEvent,
    isModerator,
    isScreenSharing,
    screenShareStream,
    toggleScreenShare,
    isRecording,
    recordingOwnerName,
    startRecording,
    stopRecording,
    leave,
  }
}
