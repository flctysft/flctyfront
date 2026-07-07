import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FileText, CheckCircle2, XCircle } from 'lucide-react'
import api from '../../lib/api.js'
import BackLink from '../../components/BackLink.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import { formatDateTime } from '../../lib/format.js'

export default function CodingTestReport() {
  const { id, invitationId } = useParams()
  const [attempt, setAttempt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    api
      .get(`/employer/coding-tests/${id}/invitations/${invitationId}/report`)
      .then(({ data }) => setAttempt(data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load this report.'))
      .finally(() => setLoading(false))
  }, [id, invitationId])

  if (loading) {
    return <div className="mx-auto max-w-3xl px-6 py-16 text-center text-slate-500">Loading...</div>
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <BackLink to={`/employer/coding-tests/${id}/dashboard`} label="Back to dashboard" />
      <div className="mt-4">
        <PageHeader icon={FileText} title="Candidate Report" subtitle={attempt ? `Submitted ${formatDateTime(attempt.submittedAt)}` : ''} />
      </div>

      {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}

      {attempt && (
        <>
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            {attempt.passed ? (
              <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
            ) : (
              <XCircle size={32} className="mx-auto text-red-400" />
            )}
            <p className="mt-3 text-2xl font-bold text-slate-900">{attempt.scorePercent}%</p>
            <p className="mt-1 text-sm font-medium text-slate-600">{attempt.passed ? 'Passed' : 'Did not pass'}</p>
            <p className="mt-2 text-xs text-slate-400">Language: {attempt.pistonLanguage} {attempt.pistonVersion}</p>
          </div>

          <div className="mt-4 space-y-3">
            {attempt.questions.map((q) => (
              <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="font-semibold text-slate-900">{q.title}</span>
                  <span className="text-sm text-slate-500">{q.scoreEarned ?? 0} / {q.maxScore} pts</span>
                </button>
                {expandedId === q.id && (
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
                    {q.candidateCode || '(no code submitted)'}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
