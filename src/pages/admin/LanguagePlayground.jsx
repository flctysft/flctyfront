import { useEffect, useState } from 'react'
import { PlayCircle, Loader2 } from 'lucide-react'
import api from '../../lib/api.js'
import BackLink from '../../components/BackLink.jsx'
import PageHeader from '../../components/PageHeader.jsx'

export default function LanguagePlayground() {
  const [languages, setLanguages] = useState([])
  const [languageKey, setLanguageKey] = useState('')
  const [sourceCode, setSourceCode] = useState('')
  const [stdin, setStdin] = useState('')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/admin/languages').then(({ data }) => {
      const enabled = data.filter((l) => l.enabled)
      setLanguages(enabled)
      if (enabled.length > 0) {
        const first = enabled[0]
        setLanguageKey(`${first.pistonLanguage}::${first.pistonVersion}`)
        setSourceCode(first.defaultTemplate || '')
      }
    })
  }, [])

  function handleLanguageChange(key) {
    setLanguageKey(key)
    const language = languages.find((l) => `${l.pistonLanguage}::${l.pistonVersion}` === key)
    if (language?.defaultTemplate) setSourceCode(language.defaultTemplate)
  }

  async function handleRun(e) {
    e.preventDefault()
    setError('')
    setResult(null)
    setRunning(true)
    const [pistonLanguage, pistonVersion] = languageKey.split('::')
    try {
      const { data } = await api.post('/compiler/execute', {
        pistonLanguage,
        pistonVersion,
        sourceCode,
        stdin,
      })
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not run this code.')
    } finally {
      setRunning(false)
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <BackLink to="/admin/languages" label="Back to languages" />
      <div className="mt-4">
        <PageHeader
          icon={PlayCircle}
          title="Language playground"
          subtitle="Sanity-check that a configured language actually executes end-to-end."
        />
      </div>

      {languages.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">
          No enabled languages yet - add one in Language Management first.
        </p>
      ) : (
        <form onSubmit={handleRun} className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {error && <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Language</span>
            <select value={languageKey} onChange={(e) => handleLanguageChange(e.target.value)} className="input">
              {languages.map((l) => (
                <option key={`${l.pistonLanguage}::${l.pistonVersion}`} value={`${l.pistonLanguage}::${l.pistonVersion}`}>
                  {l.displayName}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Code</span>
            <textarea
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              className="input min-h-48 font-mono text-xs"
              spellCheck={false}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Stdin (optional)</span>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              className="input min-h-16 font-mono text-xs"
              spellCheck={false}
            />
          </label>

          <button
            type="submit"
            disabled={running}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {running ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
            {running ? 'Running...' : 'Run'}
          </button>

          {result && (
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                <span>Status: {result.status}</span>
                {result.exitCode != null && <span>Exit code: {result.exitCode}</span>}
                {result.executionTimeMs != null && <span>Time: {result.executionTimeMs}ms</span>}
                {result.memoryKb != null && <span>Memory: {result.memoryKb}KB</span>}
              </div>
              {result.stdout && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">stdout</p>
                  <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-900 p-3 text-xs text-slate-100">{result.stdout}</pre>
                </div>
              )}
              {result.stderr && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">stderr</p>
                  <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded-lg bg-red-950 p-3 text-xs text-red-100">{result.stderr}</pre>
                </div>
              )}
            </div>
          )}
        </form>
      )}
    </section>
  )
}
