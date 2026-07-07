import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, PlayCircle, Eye } from 'lucide-react'
import api from '../../lib/api.js'
import StatusBadge from '../../components/StatusBadge.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import { formatDateTime } from '../../lib/format.js'

const STATUS_STYLES = {
  INVITED: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-amber-50 text-amber-700',
  SUBMITTED: 'bg-emerald-50 text-emerald-700',
  EXPIRED: 'bg-red-50 text-red-600',
}

export default function CodingTests() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/candidate/coding-tests').then(({ data }) => setTests(data)).finally(() => setLoading(false))
  }, [])

  function isOpen(test) {
    const now = new Date()
    return now >= new Date(test.startAt) && now <= new Date(test.endAt)
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <PageHeader icon={ClipboardList} title="Coding Tests" subtitle="Assessments employers have invited you to take." />

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading...</p>}
        {!loading && tests.length === 0 && <p className="text-sm text-slate-500">No coding tests yet.</p>}
        {tests.map((test) => (
          <div key={test.testId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">{test.testTitle}</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  {formatDateTime(test.startAt)} &ndash; {formatDateTime(test.endAt)} &middot; {test.durationMinutes} min
                </p>
              </div>
              <StatusBadge status={test.status} styles={STATUS_STYLES} />
            </div>

            <div className="mt-3">
              {(test.status === 'INVITED' || test.status === 'IN_PROGRESS') && isOpen(test) && (
                <Link
                  to={`/candidate/coding-tests/${test.testId}`}
                  className="flex w-fit items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <PlayCircle size={14} /> {test.status === 'IN_PROGRESS' ? 'Resume' : 'Start'}
                </Link>
              )}
              {test.status === 'SUBMITTED' && (
                <Link
                  to={`/candidate/coding-tests/${test.testId}`}
                  className="flex w-fit items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <Eye size={14} /> View result
                </Link>
              )}
              {test.status === 'INVITED' && !isOpen(test) && (
                <p className="text-sm text-slate-400">
                  {new Date() < new Date(test.startAt) ? 'Opens' : 'Closed'} {formatDateTime(test.startAt)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
