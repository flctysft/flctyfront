import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Code2, Plus, Pencil, Trash2 } from 'lucide-react'
import api from '../../lib/api.js'
import PageHeader from '../../components/PageHeader.jsx'
import { titleCase } from '../../lib/format.js'

const DIFFICULTY_STYLES = {
  EASY: 'bg-emerald-50 text-emerald-700',
  MEDIUM: 'bg-amber-50 text-amber-700',
  HARD: 'bg-red-50 text-red-700',
}

export default function CodingQuestions() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadQuestions()
  }, [])

  async function loadQuestions() {
    setLoading(true)
    try {
      const { data } = await api.get('/employer/coding-questions')
      setQuestions(data)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this question? This cannot be undone.')) return
    setError('')
    try {
      await api.delete(`/employer/coding-questions/${id}`)
      await loadQuestions()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete this question.')
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <PageHeader
        icon={Code2}
        title="Coding Questions"
        subtitle="Your question bank for building coding tests."
        actions={
          <Link
            to="/employer/coding-questions/new"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus size={16} /> Add Question
          </Link>
        }
      />

      {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading questions...</p>}
        {!loading && questions.length === 0 && (
          <p className="text-sm text-slate-500">You haven't created any questions yet.</p>
        )}
        {questions.map((question) => (
          <div key={question.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">{question.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{question.description}</p>
              </div>
              <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${DIFFICULTY_STYLES[question.difficulty]}`}>
                {titleCase(question.difficulty)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {question.points} pts
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {question.testCases.length} test case{question.testCases.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                to={`/employer/coding-questions/${question.id}/edit`}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Pencil size={14} /> Edit
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(question.id)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
