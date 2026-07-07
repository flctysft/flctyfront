import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { PlayCircle, Send, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import api from '../../lib/api.js'
import BackLink from '../../components/BackLink.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import { formatDateTime } from '../../lib/format.js'

export default function CodingTestAttempt() {
  const { id } = useParams()
  const [testDetail, setTestDetail] = useState(null)
  const [attempt, setAttempt] = useState(null)
  const [attemptChecked, setAttemptChecked] = useState(false)
  const [languages, setLanguages] = useState([])
  const [languageKey, setLanguageKey] = useState('')
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [codeByQuestion, setCodeByQuestion] = useState({})
  const [running, setRunning] = useState(false)
  const [runResult, setRunResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [remainingMs, setRemainingMs] = useState(0)
  const lastSavedCode = useRef({})

  useEffect(() => {
    api.get(`/candidate/coding-tests/${id}`).then(({ data }) => setTestDetail(data))
    api.get('/languages').then(({ data }) => {
      setLanguages(data)
      if (data.length > 0) setLanguageKey(`${data[0].pistonLanguage}::${data[0].pistonVersion}`)
    })
    loadAttempt()
  }, [id])

  async function loadAttempt() {
    try {
      const { data } = await api.get(`/candidate/coding-tests/${id}/attempt`)
      applyAttempt(data)
    } catch {
      setAttempt(null)
    } finally {
      setAttemptChecked(true)
    }
  }

  function applyAttempt(data) {
    setAttempt(data)
    const initial = {}
    data.questions.forEach((q) => {
      initial[q.id] = q.candidateCode || ''
    })
    setCodeByQuestion(initial)
    lastSavedCode.current = { ...initial }
  }

  useEffect(() => {
    if (!attempt || attempt.status !== 'IN_PROGRESS') return
    const tick = () => setRemainingMs(Math.max(0, new Date(attempt.endsAt).getTime() - Date.now()))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [attempt])

  useEffect(() => {
    if (!attempt || attempt.status !== 'IN_PROGRESS' || remainingMs > 0) return
    loadAttempt()
  }, [remainingMs, attempt])

  useEffect(() => {
    if (!attempt || attempt.status !== 'IN_PROGRESS') return
    const interval = setInterval(() => {
      const question = attempt.questions[activeIndex]
      if (!question) return
      const code = codeByQuestion[question.id]
      if (code !== lastSavedCode.current[question.id]) {
        api.patch(`/candidate/attempts/${attempt.id}/questions/${question.id}`, { code }).catch(() => {})
        lastSavedCode.current[question.id] = code
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [attempt, activeIndex, codeByQuestion])

  const activeQuestion = attempt?.questions?.[activeIndex]

  async function handleStart(e) {
    e.preventDefault()
    setError('')
    setStarting(true)
    const [pistonLanguage, pistonVersion] = languageKey.split('::')
    try {
      const { data } = await api.post(`/candidate/coding-tests/${id}/start`, { pistonLanguage, pistonVersion })
      applyAttempt(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start this test.')
    } finally {
      setStarting(false)
    }
  }

  async function handleRun() {
    if (!activeQuestion) return
    setError('')
    setRunning(true)
    setRunResult(null)
    try {
      const code = codeByQuestion[activeQuestion.id]
      const { data } = await api.post(
        `/candidate/attempts/${attempt.id}/questions/${activeQuestion.id}/run`,
        { code },
      )
      lastSavedCode.current[activeQuestion.id] = code
      setRunResult(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not run this code.')
    } finally {
      setRunning(false)
    }
  }

  async function handleSubmit() {
    if (!confirm('Submit the test? You cannot make further changes after submitting.')) return
    setError('')
    setSubmitting(true)
    try {
      const { data } = await api.post(`/candidate/attempts/${attempt.id}/submit`)
      applyAttempt(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit this test.')
    } finally {
      setSubmitting(false)
    }
  }

  const timeLabel = useMemo(() => {
    const totalSeconds = Math.floor(remainingMs / 1000)
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${m}:${String(s).padStart(2, '0')}`
  }, [remainingMs])

  if (!testDetail || !attemptChecked) {
    return <div className="mx-auto max-w-3xl px-6 py-16 text-center text-slate-500">Loading...</div>
  }

  // Not started yet - instructions + language picker.
  if (!attempt) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-12">
        <BackLink to="/candidate/coding-tests" label="Back to coding tests" />
        <div className="mt-4">
          <PageHeader
            icon={Clock}
            title={testDetail.title}
            subtitle={`${testDetail.durationMinutes} minutes · passing score ${testDetail.passingScorePercent}%`}
          />
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}
          <p className="whitespace-pre-line text-sm text-slate-700">{testDetail.instructions}</p>
          <p className="mt-4 text-xs text-slate-400">
            Available {formatDateTime(testDetail.startAt)} – {formatDateTime(testDetail.endAt)}
          </p>

          <form onSubmit={handleStart} className="mt-6 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Choose your language</span>
              <select value={languageKey} onChange={(e) => setLanguageKey(e.target.value)} className="input">
                {languages.map((l) => (
                  <option key={`${l.pistonLanguage}::${l.pistonVersion}`} value={`${l.pistonLanguage}::${l.pistonVersion}`}>
                    {l.displayName}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={starting || languages.length === 0}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              <PlayCircle size={16} /> {starting ? 'Starting...' : 'Start Test'}
            </button>
          </form>
        </div>
      </section>
    )
  }

  // Already finished - results view.
  if (attempt.status !== 'IN_PROGRESS') {
    return (
      <section className="mx-auto max-w-2xl px-6 py-12">
        <BackLink to="/candidate/coding-tests" label="Back to coding tests" />
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          {attempt.passed ? (
            <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
          ) : (
            <XCircle size={32} className="mx-auto text-red-400" />
          )}
          <p className="mt-3 text-2xl font-bold text-slate-900">{attempt.scorePercent}%</p>
          <p className="mt-1 text-sm font-medium text-slate-600">
            {attempt.passed ? 'You passed this test.' : 'You did not meet the passing score.'}
          </p>
        </div>

        <div className="mt-4 space-y-2">
          {attempt.questions.map((q) => (
            <div key={q.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
              <span className="font-medium text-slate-700">{q.title}</span>
              <span className="text-slate-500">{q.scoreEarned ?? 0} / {q.maxScore} pts</span>
            </div>
          ))}
        </div>
      </section>
    )
  }

  // In progress - the main test-taking screen.
  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
        <p className="font-semibold text-slate-900">{testDetail.title}</p>
        <div className="flex items-center gap-4">
          <span className={`flex items-center gap-1.5 text-sm font-semibold ${remainingMs < 60_000 ? 'text-red-600' : 'text-slate-700'}`}>
            <Clock size={15} /> {timeLabel}
          </span>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            <Send size={14} /> {submitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </div>

      {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}

      <div className="mt-4 grid gap-4 lg:grid-cols-[220px_1fr]">
        <div className="space-y-1.5">
          {attempt.questions.map((q, index) => (
            <button
              key={q.id}
              type="button"
              onClick={() => {
                setRunResult(null)
                setActiveIndex(index)
              }}
              className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                index === activeIndex ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="block text-xs text-slate-400">{q.sectionTitle}</span>
              {q.title}
            </button>
          ))}
        </div>

        {activeQuestion && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900">{activeQuestion.title}</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{activeQuestion.description}</p>

              {activeQuestion.visibleTestCases.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sample cases</p>
                  {activeQuestion.visibleTestCases.map((tc) => (
                    <div key={tc.id} className="rounded-lg bg-slate-50 p-2 text-xs">
                      <p><span className="font-semibold text-slate-500">Input:</span> {tc.stdin || '(none)'}</p>
                      <p><span className="font-semibold text-slate-500">Expected:</span> {tc.expectedOutput}</p>
                    </div>
                  ))}
                </div>
              )}

              {runResult && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Run results</p>
                  {runResult.results.map((r, i) => (
                    <div key={i} className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium ${r.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                      {r.passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      Case {i + 1}: {r.passed ? 'Passed' : `Got "${r.actualOutput ?? ''}"`}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="h-96 overflow-hidden rounded-xl border border-slate-100">
                <Editor
                  height="100%"
                  language={undefined}
                  value={codeByQuestion[activeQuestion.id] ?? ''}
                  onChange={(value) => setCodeByQuestion((prev) => ({ ...prev, [activeQuestion.id]: value ?? '' }))}
                  theme="vs-dark"
                  options={{ minimap: { enabled: false }, fontSize: 13 }}
                />
              </div>
              <button
                type="button"
                onClick={handleRun}
                disabled={running}
                className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {running ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                {running ? 'Running...' : 'Run'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
