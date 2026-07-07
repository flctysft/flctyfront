import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Users, Send, Mail, ChevronRight } from 'lucide-react'
import api from '../../lib/api.js'
import BackLink from '../../components/BackLink.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { formatDateTime } from '../../lib/format.js'

const INVITATION_STATUS_STYLES = {
  INVITED: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-amber-50 text-amber-700',
  SUBMITTED: 'bg-emerald-50 text-emerald-700',
  EXPIRED: 'bg-red-50 text-red-600',
}

export default function CodingTestDashboard() {
  const { id } = useParams()
  const [test, setTest] = useState(null)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [id])

  async function loadData() {
    setLoading(true)
    try {
      const [testResult, reportResult] = await Promise.all([
        api.get(`/employer/coding-tests/${id}`),
        api.get(`/employer/coding-tests/${id}/report`),
      ])
      setTest(testResult.data)
      setReport(reportResult.data)
    } finally {
      setLoading(false)
    }
  }

  async function handleInvite(e) {
    e.preventDefault()
    setError('')
    setInviting(true)
    try {
      await api.post(`/employer/coding-tests/${id}/invitations`, { email })
      setEmail('')
      await loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not invite this candidate.')
    } finally {
      setInviting(false)
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-3xl px-6 py-16 text-center text-slate-500">Loading...</div>
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <BackLink to="/employer/coding-tests" label="Back to coding tests" />
      <div className="mt-4">
        <PageHeader icon={Users} title={test.title} subtitle={`Invitations & reports · ${formatDateTime(test.startAt)} – ${formatDateTime(test.endAt)}`} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatBox label="Invited" value={report.totalInvited} />
        <StatBox label="Submitted" value={report.totalSubmitted} />
        <StatBox label="Passed" value={report.passCount} />
        <StatBox label="Avg score" value={report.averageScorePercent != null ? `${Math.round(report.averageScorePercent)}%` : '-'} />
      </div>

      <form onSubmit={handleInvite} className="mt-6 flex flex-wrap items-end gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        {error && <div className="w-full rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}
        <label className="flex-1 min-w-[200px]">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Invite a candidate by email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="candidate@example.com"
            className="input"
          />
        </label>
        <button
          type="submit"
          disabled={inviting}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          <Send size={15} /> {inviting ? 'Inviting...' : 'Invite'}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {report.candidates.length === 0 && (
          <p className="text-sm text-slate-500">No candidates invited yet.</p>
        )}
        {report.candidates.map((candidate) => (
          <Link
            key={candidate.invitationId}
            to={`/employer/coding-tests/${id}/invitations/${candidate.invitationId}/report`}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200"
          >
            <div>
              <p className="font-semibold text-slate-900">{candidate.candidateName}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                <Mail size={13} /> {candidate.candidateEmail}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {candidate.scorePercent != null && (
                <span className="text-sm font-semibold text-slate-700">{candidate.scorePercent}%</span>
              )}
              <StatusBadge status={candidate.status} styles={INVITATION_STATUS_STYLES} />
              <ChevronRight size={16} className="text-slate-400" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function StatBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </div>
  )
}
