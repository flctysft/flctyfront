import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Video,
  Clock,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  ShieldAlert,
  WifiOff,
  ScreenShare,
  ScreenShareOff,
  Circle,
  Disc,
} from 'lucide-react'
import api from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useCallRoom } from '../lib/callClient.js'
import { useActiveSpeakers } from '../lib/audioActivity.js'
import VideoGrid from '../components/VideoGrid.jsx'
import CallToasts from '../components/CallToasts.jsx'

export default function InterviewRoom() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const panelistToken = searchParams.get('callToken')
  const { user, loading: authLoading } = useAuth()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [token, setToken] = useState('')

  useEffect(() => {
    if (panelistToken) {
      setToken(panelistToken)
      setStatus('ready')
      return
    }

    if (authLoading || !user) return

    let cancelled = false

    async function join() {
      const endpoint =
        user.role === 'EMPLOYER' ? `/employer/interviews/${id}/join` : `/candidate/interviews/${id}/join`
      try {
        const { data } = await api.post(endpoint)
        if (cancelled) return
        setToken(data.token)
        setStatus('ready')
      } catch (err) {
        if (cancelled) return
        setMessage(err.response?.data?.message || 'Could not join this interview.')
        setStatus('error')
      }
    }

    join()
    return () => {
      cancelled = true
    }
  }, [id, user, authLoading, panelistToken])

  if (!panelistToken && !authLoading && !user) {
    return <Navigate to="/login" replace />
  }

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center text-slate-500">
        Connecting to interview room...
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <Clock size={28} className="mx-auto text-slate-400" />
        <p className="mt-4 text-sm font-medium text-slate-700">{message}</p>
      </div>
    )
  }

  const dashboardPath = user ? (user.role === 'EMPLOYER' ? '/employer/dashboard' : '/candidate/dashboard') : '/'

  return <CallRoom token={token} interviewId={id} dashboardPath={dashboardPath} />
}

function CallRoom({ token, interviewId, dashboardPath }) {
  const navigate = useNavigate()
  const {
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
  } = useCallRoom(token, interviewId)

  const remoteEntries = [...remoteStreams.entries()]
  const streamsForSpeakerDetection = new Map(remoteEntries)
  if (localStream) streamsForSpeakerDetection.set('self', localStream)
  const speakingIds = useActiveSpeakers(streamsForSpeakerDetection)

  function handleLeave() {
    leave()
  }

  function handleReconnect() {
    navigate(0)
  }

  useEffect(() => {
    if (connectionState !== 'closed') return
    const timer = setTimeout(() => navigate(dashboardPath), 2500)
    return () => clearTimeout(timer)
  }, [connectionState, dashboardPath, navigate])

  if (connectionState === 'error') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <ShieldAlert size={28} className="mx-auto text-red-400" />
        <p className="mt-4 text-sm font-medium text-slate-700">{error || 'Something went wrong joining the call.'}</p>
      </div>
    )
  }

  if (connectionState === 'disconnected') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <WifiOff size={28} className="mx-auto text-amber-400" />
        <p className="mt-4 text-sm font-medium text-slate-700">You were disconnected from the call.</p>
        <button
          type="button"
          onClick={handleReconnect}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Rejoin
        </button>
      </div>
    )
  }

  if (connectionState === 'closed') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <PhoneOff size={28} className="mx-auto text-slate-400" />
        <p className="mt-4 text-sm font-medium text-slate-700">Call ended. Taking you to your dashboard...</p>
        <button
          type="button"
          onClick={() => navigate(dashboardPath)}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Go to dashboard
        </button>
      </div>
    )
  }

  const tiles = [
    {
      key: 'self',
      stream: screenShareStream || localStream,
      label: 'You',
      muted: true,
      mirrored: !isScreenSharing,
      videoOff: !isScreenSharing && !cameraEnabled,
      speaking: speakingIds.has('self'),
      sharingScreen: isScreenSharing,
    },
    ...remoteEntries.map(([peerId, stream]) => ({
      key: peerId,
      stream,
      label: participants.get(peerId)?.name || 'Participant',
      speaking: speakingIds.has(peerId),
      sharingScreen: Boolean(participants.get(peerId)?.sharingScreen),
    })),
  ]

  return (
    <div className="relative flex h-[calc(100vh-73px)] flex-col bg-slate-900">
      <CallToasts events={events} onDismiss={dismissEvent} />

      <div className="flex items-center gap-2 border-b border-slate-800 px-6 py-3">
        <Video size={16} className="text-indigo-400" />
        <span className="text-sm font-semibold text-slate-200">Interview room</span>
        <span className="text-xs text-slate-500">
          {connectionState === 'connecting' ? 'Connecting...' : `${remoteEntries.length + 1} in call`}
        </span>
        {isRecording && (
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-red-600/20 px-2.5 py-1 text-xs font-medium text-red-400">
            <Circle size={8} className="fill-red-500 text-red-500" />
            Recording{recordingOwnerName ? ` · ${recordingOwnerName}` : ''}
          </span>
        )}
      </div>

      <VideoGrid tiles={tiles} emptyMessage="Waiting for the other participant to join..." />

      <div className="flex items-center justify-center gap-3 border-t border-slate-800 px-6 py-4">
        <button
          type="button"
          onClick={toggleMic}
          className={`flex h-11 w-11 items-center justify-center rounded-full ${micEnabled ? 'bg-slate-700 text-white' : 'bg-red-600 text-white'}`}
          title={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {micEnabled ? <Mic size={18} /> : <MicOff size={18} />}
        </button>
        <button
          type="button"
          onClick={toggleCamera}
          className={`flex h-11 w-11 items-center justify-center rounded-full ${cameraEnabled ? 'bg-slate-700 text-white' : 'bg-red-600 text-white'}`}
          title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {cameraEnabled ? <Video size={18} /> : <VideoOff size={18} />}
        </button>
        <button
          type="button"
          onClick={toggleScreenShare}
          className={`flex h-11 w-11 items-center justify-center rounded-full ${isScreenSharing ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-white'}`}
          title={isScreenSharing ? 'Stop sharing your screen' : 'Share your screen'}
        >
          {isScreenSharing ? <ScreenShareOff size={18} /> : <ScreenShare size={18} />}
        </button>
        {isModerator && (
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex h-11 w-11 items-center justify-center rounded-full ${isRecording ? 'bg-red-600 text-white' : 'bg-slate-700 text-white'}`}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? <Disc size={18} /> : <Circle size={18} />}
          </button>
        )}
        <button
          type="button"
          onClick={handleLeave}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
          title="Leave call"
        >
          <PhoneOff size={18} />
        </button>
      </div>
    </div>
  )
}
