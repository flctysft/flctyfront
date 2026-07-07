import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import api from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatDateTime } from '../lib/format.js'

const POLL_MS = 20000

export default function NotificationBell() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function poll() {
      try {
        const { data } = await api.get('/notifications/unread-count')
        if (!cancelled) setUnreadCount(data.count)
      } catch {
        // ignore transient polling errors
      }
    }

    poll()
    const interval = setInterval(poll, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [user])

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function toggleOpen() {
    const next = !open
    setOpen(next)
    if (next) {
      setLoading(true)
      try {
        const { data } = await api.get('/notifications')
        setNotifications(data)
      } finally {
        setLoading(false)
      }
    }
  }

  async function handleSelect(notification) {
    setOpen(false)
    if (!notification.read) {
      api.patch(`/notifications/${notification.id}/read`).catch(() => {})
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
    if (user.role === 'CANDIDATE' && notification.relatedApplicationId) {
      navigate(`/candidate/applications/${notification.relatedApplicationId}/offer`)
    } else if (user.role === 'EMPLOYER' && notification.relatedJobId) {
      navigate(`/employer/jobs/${notification.relatedJobId}/applicants`)
    }
  }

  if (!user) return null

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggleOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">
            Notifications
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading && <p className="px-4 py-3 text-sm text-slate-500">Loading...</p>}
            {!loading && notifications.length === 0 && (
              <p className="px-4 py-3 text-sm text-slate-500">No notifications yet.</p>
            )}
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleSelect(notification)}
                className={`block w-full border-b border-slate-50 px-4 py-3 text-left text-sm hover:bg-slate-50 ${
                  notification.read ? 'text-slate-500' : 'font-medium text-slate-900'
                }`}
              >
                <p>{notification.message}</p>
                <p className="mt-1 text-xs text-slate-400">{formatDateTime(notification.createdAt)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
