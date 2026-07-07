import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, XCircle } from 'lucide-react'
import api from '../../lib/api.js'
import StatusBadge from '../../components/StatusBadge.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import { APPLICATION_STATUS_STYLES, formatDate } from '../../lib/format.js'

const OFFER_FLOW_STATUSES = ['SELECTED', 'TERMS_ACCEPTED', 'OFFER_SENT', 'OFFER_ACCEPTED']
const WITHDRAWABLE_STATUSES = ['APPLIED', 'UNDER_REVIEW', 'APPROVED']

export default function MyApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [withdrawingId, setWithdrawingId] = useState(null)

  useEffect(() => {
    loadApplications()
  }, [])

  async function loadApplications() {
    setLoading(true)
    try {
      const { data } = await api.get('/candidate/applications')
      setApplications(data)
    } finally {
      setLoading(false)
    }
  }

  async function handleWithdraw(applicationId) {
    if (!confirm('Withdraw this application? This cannot be undone.')) return
    setWithdrawingId(applicationId)
    try {
      await api.post(`/candidate/applications/${applicationId}/withdraw`)
      await loadApplications()
    } finally {
      setWithdrawingId(null)
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <PageHeader
        icon={FileText}
        title="My Applications"
        subtitle="Track the status of jobs you've applied to."
      />

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading applications...</p>}
        {!loading && applications.length === 0 && (
          <p className="text-sm text-slate-500">
            You haven't applied to any jobs yet. <Link to="/jobs" className="font-semibold text-indigo-600">Browse jobs</Link>
          </p>
        )}
        {applications.map((app) => (
          <div key={app.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link to={`/jobs/${app.jobId}`} className="font-semibold text-slate-900 hover:text-indigo-600">
                  {app.jobTitle}
                </Link>
                <p className="mt-0.5 text-sm text-slate-500">Applied {formatDate(app.appliedAt)}</p>
              </div>
              <StatusBadge status={app.status} styles={APPLICATION_STATUS_STYLES} />
            </div>
            {app.coverLetter && (
              <p className="mt-3 whitespace-pre-line text-sm text-slate-600">{app.coverLetter}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {OFFER_FLOW_STATUSES.includes(app.status) && (
                <Link
                  to={`/candidate/applications/${app.id}/offer`}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <FileText size={14} /> View offer
                </Link>
              )}
              {WITHDRAWABLE_STATUSES.includes(app.status) && (
                <button
                  type="button"
                  onClick={() => handleWithdraw(app.id)}
                  disabled={withdrawingId === app.id}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                >
                  <XCircle size={14} /> {withdrawingId === app.id ? 'Withdrawing...' : 'Withdraw'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
