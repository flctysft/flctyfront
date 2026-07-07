import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Plus, Pencil, Trash2, Users, Send, Undo2, Archive } from 'lucide-react'
import api from '../../lib/api.js'
import StatusBadge from '../../components/StatusBadge.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import { formatDateTime } from '../../lib/format.js'

const STATUS_STYLES = {
  DRAFT: 'bg-slate-100 text-slate-600',
  PUBLISHED: 'bg-emerald-50 text-emerald-700',
  ARCHIVED: 'bg-slate-100 text-slate-500',
}

export default function CodingTests() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTests()
  }, [])

  async function loadTests() {
    setLoading(true)
    try {
      const { data } = await api.get('/employer/coding-tests')
      setTests(data)
    } finally {
      setLoading(false)
    }
  }

  async function handlePublish(id) {
    setError('')
    try {
      await api.patch(`/employer/coding-tests/${id}/publish`)
      await loadTests()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not publish this test.')
    }
  }

  async function handleDraft(id) {
    setError('')
    try {
      await api.patch(`/employer/coding-tests/${id}/draft`)
      await loadTests()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not move this test back to draft.')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this coding test? This cannot be undone.')) return
    setError('')
    try {
      await api.delete(`/employer/coding-tests/${id}`)
      await loadTests()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete this test.')
    }
  }

  async function handleArchive(id) {
    setError('')
    try {
      await api.patch(`/employer/coding-tests/${id}/archive`)
      await loadTests()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not archive this test.')
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <PageHeader
        icon={ClipboardList}
        title="Coding Tests"
        subtitle="Build and manage timed coding assessments for candidates."
        actions={
          <Link
            to="/employer/coding-tests/new"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus size={16} /> Create Test
          </Link>
        }
      />

      {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading tests...</p>}
        {!loading && tests.length === 0 && (
          <p className="text-sm text-slate-500">You haven't created any coding tests yet.</p>
        )}
        {tests.map((test) => (
          <div key={test.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">{test.title}</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  {formatDateTime(test.startAt)} &ndash; {formatDateTime(test.endAt)} &middot; {test.durationMinutes} min
                  &middot; {test.sections.length} section{test.sections.length === 1 ? '' : 's'}
                </p>
              </div>
              <StatusBadge status={test.status} styles={STATUS_STYLES} />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                to={`/employer/coding-tests/${test.id}/dashboard`}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Users size={14} /> Invitations & Report
              </Link>
              {test.status === 'DRAFT' && (
                <>
                  <Link
                    to={`/employer/coding-tests/${test.id}/edit`}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <Pencil size={14} /> Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handlePublish(test.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    <Send size={14} /> Publish
                  </button>
                </>
              )}
              {test.status === 'PUBLISHED' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleDraft(test.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <Undo2 size={14} /> Move to Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleArchive(test.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <Archive size={14} /> Archive
                  </button>
                </>
              )}
              {test.status !== 'ARCHIVED' && (
                <button
                  type="button"
                  onClick={() => handleDelete(test.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
