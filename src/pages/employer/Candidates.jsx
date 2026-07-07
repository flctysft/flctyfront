import { useEffect, useState } from 'react'
import { Users, ChevronDown, ChevronUp, Briefcase, Send } from 'lucide-react'
import api from '../../lib/api.js'
import StatusBadge from '../../components/StatusBadge.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import { APPLICATION_STATUS_STYLES, formatDate, formatDateTime } from '../../lib/format.js'

export default function Candidates() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    api
      .get('/employer/candidates')
      .then(({ data }) => setCandidates(data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <PageHeader
        icon={Users}
        title="Candidates"
        subtitle="Every candidate who has applied across all your job postings."
      />

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading candidates...</p>}
        {!loading && candidates.length === 0 && (
          <p className="text-sm text-slate-500">No candidates have applied to your jobs yet.</p>
        )}
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.candidateId}
            candidate={candidate}
            expanded={expandedId === candidate.candidateId}
            onToggle={() =>
              setExpandedId(expandedId === candidate.candidateId ? null : candidate.candidateId)
            }
          />
        ))}
      </div>
    </section>
  )
}

function CandidateCard({ candidate, expanded, onToggle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-900">{candidate.candidateName}</p>
          <p className="mt-0.5 text-sm text-slate-500">{candidate.candidateEmail}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <Briefcase size={12} />
            {candidate.applicationCount} application{candidate.applicationCount === 1 ? '' : 's'} &middot; last
            applied {formatDate(candidate.latestAppliedAt)}
          </p>
        </div>
        <StatusBadge status={candidate.latestStatus} styles={APPLICATION_STATUS_STYLES} />
      </div>

      <button
        type="button"
        onClick={onToggle}
        className="mt-3 flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
      >
        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        {expanded ? 'Hide details' : 'View applications & notes'}
      </button>

      {expanded && <CandidateDetail candidateId={candidate.candidateId} />}
    </div>
  )
}

function CandidateDetail({ candidateId }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  useEffect(() => {
    loadDetail()
  }, [candidateId])

  async function loadDetail() {
    setLoading(true)
    try {
      const { data } = await api.get(`/employer/candidates/${candidateId}`)
      setDetail(data)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddNote(e) {
    e.preventDefault()
    if (!noteText.trim()) return
    setSavingNote(true)
    try {
      await api.post(`/employer/candidates/${candidateId}/notes`, { note: noteText.trim() })
      setNoteText('')
      await loadDetail()
    } finally {
      setSavingNote(false)
    }
  }

  if (loading) {
    return <p className="mt-4 text-sm text-slate-500">Loading details...</p>
  }

  if (!detail) return null

  return (
    <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Applications</h3>
        <div className="mt-2 space-y-2">
          {detail.applications.map((app) => (
            <div
              key={app.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm"
            >
              <span className="text-slate-700">
                {app.jobTitle} &middot; applied {formatDate(app.appliedAt)}
              </span>
              <StatusBadge status={app.status} styles={APPLICATION_STATUS_STYLES} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900">Notes</h3>
        <div className="mt-2 space-y-2">
          {detail.notes.length === 0 && <p className="text-sm text-slate-500">No notes yet.</p>}
          {detail.notes.map((note) => (
            <div key={note.id} className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-sm">
              <p className="text-slate-700">{note.note}</p>
              <p className="mt-1 text-xs text-slate-400">{formatDateTime(note.createdAt)}</p>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddNote} className="mt-3 flex items-start gap-2">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a private note about this candidate..."
            className="input min-h-16 flex-1"
          />
          <button
            type="submit"
            disabled={savingNote || !noteText.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60"
          >
            <Send size={14} /> {savingNote ? 'Saving...' : 'Add'}
          </button>
        </form>
      </div>
    </div>
  )
}
