import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ClipboardList, Plus, X } from 'lucide-react'
import api from '../../lib/api.js'
import BackLink from '../../components/BackLink.jsx'
import PageHeader from '../../components/PageHeader.jsx'

const emptySection = { title: '', displayOrder: 0, numberOfQuestionsToPick: 1, questionIds: [] }

export default function CodingTestForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [title, setTitle] = useState('')
  const [instructions, setInstructions] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [passingScorePercent, setPassingScorePercent] = useState(60)
  const [sections, setSections] = useState([{ ...emptySection }])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/employer/coding-questions').then(({ data }) => setQuestions(data))
  }, [])

  useEffect(() => {
    if (!isEdit) return
    api.get(`/employer/coding-tests/${id}`).then(({ data }) => {
      setTitle(data.title)
      setInstructions(data.instructions)
      setStartAt(toLocalDateTimeInput(data.startAt))
      setEndAt(toLocalDateTimeInput(data.endAt))
      setDurationMinutes(data.durationMinutes)
      setPassingScorePercent(data.passingScorePercent)
      setSections(
        data.sections.map((s) => ({
          title: s.title,
          displayOrder: s.displayOrder,
          numberOfQuestionsToPick: s.numberOfQuestionsToPick,
          questionIds: s.questions.map((q) => q.id),
        })),
      )
    }).finally(() => setLoading(false))
  }, [id, isEdit])

  function updateSection(index, field, value) {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }

  function toggleQuestion(index, questionId) {
    setSections((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s
        const has = s.questionIds.includes(questionId)
        return { ...s, questionIds: has ? s.questionIds.filter((qid) => qid !== questionId) : [...s.questionIds, questionId] }
      }),
    )
  }

  function addSection() {
    setSections((prev) => [...prev, { ...emptySection, displayOrder: prev.length }])
  }

  function removeSection(index) {
    setSections((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const payload = {
      title,
      instructions,
      startAt: new Date(startAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
      durationMinutes: Number(durationMinutes),
      passingScorePercent: Number(passingScorePercent),
      sections: sections.map((s, index) => ({ ...s, displayOrder: index, numberOfQuestionsToPick: Number(s.numberOfQuestionsToPick) })),
    }
    try {
      if (isEdit) {
        await api.put(`/employer/coding-tests/${id}`, payload)
      } else {
        await api.post('/employer/coding-tests', payload)
      }
      navigate('/employer/coding-tests')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this test.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-2xl px-6 py-16 text-center text-slate-500">Loading test...</div>
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      <BackLink to="/employer/coding-tests" label="Back to coding tests" />
      <div className="mt-4">
        <PageHeader
          icon={ClipboardList}
          title={isEdit ? 'Edit Coding Test' : 'New Coding Test'}
          subtitle="Schedule, sections, and passing criteria for this assessment."
        />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {error && <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}

        <Field label="Title">
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
        </Field>

        <Field label="Instructions">
          <textarea
            required
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="input min-h-24"
            placeholder="What candidates should know before starting."
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Opens at">
            <input required type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className="input" />
          </Field>
          <Field label="Closes at">
            <input required type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className="input" />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Duration (minutes)">
            <input required type="number" min={1} value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} className="input" />
          </Field>
          <Field label="Passing score (%)">
            <input required type="number" min={0} max={100} value={passingScorePercent} onChange={(e) => setPassingScorePercent(e.target.value)} className="input" />
          </Field>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Sections</span>
            <button
              type="button"
              onClick={addSection}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
            >
              <Plus size={12} /> Add section
            </button>
          </div>

          {questions.length === 0 && (
            <p className="mt-2 text-sm text-slate-500">
              You need at least one question in your bank before you can build sections. Add one from Coding Questions first.
            </p>
          )}

          <div className="mt-2 space-y-3">
            {sections.map((section, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Section {index + 1}</span>
                  {sections.length > 1 && (
                    <button type="button" onClick={() => removeSection(index)} className="rounded p-1 text-slate-400 hover:bg-white hover:text-red-600">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  <input
                    required
                    value={section.title}
                    onChange={(e) => updateSection(index, 'title', e.target.value)}
                    placeholder="Section title"
                    className="input bg-white sm:col-span-2"
                  />
                  <input
                    required
                    type="number"
                    min={1}
                    value={section.numberOfQuestionsToPick}
                    onChange={(e) => updateSection(index, 'numberOfQuestionsToPick', e.target.value)}
                    placeholder="# to pick"
                    className="input bg-white"
                  />
                </div>
                <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
                  {questions.length === 0 && <p className="p-1 text-xs text-slate-400">No questions available.</p>}
                  {questions.map((q) => (
                    <label key={q.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={section.questionIds.includes(q.id)}
                        onChange={() => toggleQuestion(index, q.id)}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
                      />
                      {q.title} <span className="text-xs text-slate-400">({q.points} pts)</span>
                    </label>
                  ))}
                </div>
                <p className="mt-1 text-xs text-slate-400">{section.questionIds.length} question(s) selected for this pool.</p>
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
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Test'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/employer/coding-tests')}
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

function toLocalDateTimeInput(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
