import { useEffect } from 'react'

const AUTO_DISMISS_MS = 4000

function Toast({ event, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(event.id), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [event.id, onDismiss])

  return (
    <div className="rounded-lg bg-slate-800/95 px-4 py-2 text-sm text-slate-100 shadow-lg ring-1 ring-slate-700">
      {event.text}
    </div>
  )
}

export default function CallToasts({ events, onDismiss }) {
  if (events.length === 0) return null

  return (
    <div className="pointer-events-none absolute right-4 top-4 z-10 flex flex-col gap-2">
      {events.map((event) => (
        <Toast key={event.id} event={event} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
