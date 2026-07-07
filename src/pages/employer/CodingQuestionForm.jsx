import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Code2, Plus, X } from 'lucide-react'
import api from '../../lib/api.js'
import BackLink from '../../components/BackLink.jsx'
import PageHeader from '../../components/PageHeader.jsx'

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD']

const emptyTestCase = { stdin: '', expectedOutput: '', visible: true, displayOrder: 0 }

export default function CodingQuestionForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState('EASY')
  const [points, setPoints] = useState(10)
  const [starterCode, setStarterCode] = useState('')
  const [testCases, setTestCases] = useState([{ ...emptyTestCase }])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    api.get(`/employer/coding-questions/${id}`).then(({ data }) => {
      setTitle(data.title)
      setDescription(data.description)
      setDifficulty(data.difficulty)
      setPoints(data.points)
      setStarterCode(data.starterCode || '')
      setTestCases(
        data.testCases.length
          ? data.testCases.map((tc) => ({
              stdin: tc.stdin || '',
              expectedOutput: tc.expectedOutput,
              visible: tc.visible,
              displayOrder: tc.displayOrder,
            }))
          : [{ ...emptyTestCase }],
      )
    }).finally(() => setLoading(false))
  }, [id, isEdit])

  function updateTestCase(index, field, value) {
    setTestCases((prev) => prev.map((tc, i) => (i === index ? { ...tc, [field]: value } : tc)))
  }

  function addTestCase() {
    setTestCases((prev) => [...prev, { ...emptyTestCase, displayOrder: prev.length }])
  }

  function removeTestCase(index) {
    setTestCases((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const payload = {
      title,
      description,
      difficulty,
      points: Number(points),
      starterCode,
      testCases: testCases.map((tc, index) => ({ ...tc, displayOrder: index })),
    }
    try {
      if (isEdit) {
        await api.put(`/employer/coding-questions/${id}`, payload)
      } else {
        await api.post('/employer/coding-questions', payload)
      }
      navigate('/employer/coding-questions')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this question.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-2xl px-6 py-16 text-center text-slate-500">Loading question...</div>
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      <BackLink to="/employer/coding-questions" label="Back to questions" />
      <div className="mt-4">
        <PageHeader
          icon={Code2}
          title={isEdit ? 'Edit Question' : 'New Question'}
          subtitle="Define the problem and the test cases used to grade it."
        />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {error && <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}

        <Field label="Title">
          <input required maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
        </Field>

        <Field label="Description">
          <textarea
            required
            maxLength={4000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input min-h-32"
            placeholder="Explain the problem, input format, and expected output."
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Difficulty">
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input">
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </Field>
          <Field label="Points">
            <input required type="number" min={1} value={points} onChange={(e) => setPoints(e.target.value)} className="input" />
          </Field>
        </div>

        <Field label="Starter code (optional)">
          <textarea
            value={starterCode}
            onChange={(e) => setStarterCode(e.target.value)}
            className="input min-h-24 font-mono text-xs"
            placeholder="Pre-filled code candidates see when they open this question"
          />
        </Field>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Test cases</span>
            <button
              type="button"
              onClick={addTestCase}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
            >
              <Plus size={12} /> Add test case
            </button>
          </div>

          <div className="mt-2 space-y-3">
            {testCases.map((tc, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Case {index + 1}</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                      <input
                        type="checkbox"
                        checked={tc.visible}
                        onChange={(e) => updateTestCase(index, 'visible', e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
                      />
                      Visible to candidate
                    </label>
                    {testCases.length > 1 && (
                      <button type="button" onClick={() => removeTestCase(index)} className="rounded p-1 text-slate-400 hover:bg-white hover:text-red-600">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <textarea
                    value={tc.stdin}
                    onChange={(e) => updateTestCase(index, 'stdin', e.target.value)}
                    placeholder="stdin (optional)"
                    className="input min-h-16 bg-white font-mono text-xs"
                  />
                  <textarea
                    required
                    value={tc.expectedOutput}
                    onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                    placeholder="Expected output"
                    className="input min-h-16 bg-white font-mono text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Question'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/employer/coding-questions')}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  )
}
