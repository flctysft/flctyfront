import { useEffect, useRef } from 'react'
import { ScreenShare } from 'lucide-react'

export default function VideoTile({ stream, label, muted, mirrored, videoOff, speaking, sharingScreen }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream || null
    }
  }, [stream])

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-slate-800 transition-shadow ${
        speaking ? 'ring-2 ring-emerald-400' : ''
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`h-full min-h-48 w-full object-cover ${mirrored ? 'scale-x-[-1]' : ''} ${videoOff ? 'invisible' : ''}`}
      />
      {videoOff && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
          Camera off
        </div>
      )}
      {sharingScreen && (
        <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-indigo-600/90 px-2 py-0.5 text-xs font-medium text-white">
          <ScreenShare size={12} />
          Presenting
        </span>
      )}
      <span className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-0.5 text-xs font-medium text-white">
        {label}
      </span>
    </div>
  )
}
