import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Check, X, Video, CalendarClock } from 'lucide-react'
import api from '../../lib/api.js'
import StatusBadge from '../../components/StatusBadge.jsx'
import RecordingsList from '../../components/RecordingsList.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import { INTERVIEW_STATUS_STYLES, formatDateTime, titleCase } from '../../lib/format.js'

export default function MyInterviews() {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [respondingId, setRespondingId] = useState(null)

  useEffect(() => {
    loadInterviews()
  }, [])

  async function loadInterviews() {
    setLoading(true)
    try {
      const { data } = await api.get('/candidate/interviews')
      setInterviews(data)
    } finally {
      setLoading(false)
    }
  }

  async function respond(id, status) {
    setRespondingId(id)
    try {
      await api.patch(`/candidate/interviews/${id}/response`, { status })
      await loadInterviews()
    } finally {
      setRespondingId(null)
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <PageHeader
        icon={CalendarClock}
        title="My Interviews"
        subtitle="Respond to interview invitations from employers."
      />

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading interviews...</p>}
        {!loading && interviews.length === 0 && (
          <p className="text-sm text-slate-500">You have no interviews scheduled.</p>
        )}
        {interviews.map((interview) => (
          <div key={interview.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link to={`/jobs/${interview.jobId}`} className="font-semibold text-slate-900 hover:text-indigo-600">
                  {interview.jobTitle}
                </Link>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <Calendar size={14} />
                  {interview.interviewType && `${titleCase(interview.interviewType)} · `}
                  {formatDateTime(interview.scheduledAt)}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin size={14} /> {titleCase(interview.mode)}{interview.locationOrLink ? ` · ${interview.locationOrLink}` : ''}
                </p>
                {interview.agenda && <p className="mt-2 text-sm text-slate-600">{interview.agenda}</p>}
                {interview.notes && <p className="mt-2 text-sm text-slate-600">{interview.notes}</p>}
              </div>
              <StatusBadge status={interview.status} styles={INTERVIEW_STATUS_STYLES} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(interview.status === 'SCHEDULED' || interview.status === 'ACCEPTED') &&
                interview.mode === 'ONLINE' &&
                interview.videoLinkAvailable && (
                  <Link
                    to={`/interviews/${interview.id}/room`}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    <Video size={14} /> Join
                  </Link>
                )}
              {interview.status === 'SCHEDULED' && (
                <>
                  <button
                    type="button"
                    disabled={respondingId === interview.id}
                    onClick={() => respond(interview.id, 'ACCEPTED')}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <Check size={14} /> Accept
                  </button>
                  <button
                    type="button"
                    disabled={respondingId === interview.id}
                    onClick={() => respond(interview.id, 'DECLINED')}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    <X size={14} /> Decline
                  </button>
                </>
              )}
            </div>

            {interview.mode === 'ONLINE' && (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <RecordingsList interviewId={interview.id} role="candidate" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
