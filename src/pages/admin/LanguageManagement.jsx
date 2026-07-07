import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Code2, Plus, Pencil, Trash2, PlayCircle, X } from 'lucide-react'
import api from '../../lib/api.js'
import PageHeader from '../../components/PageHeader.jsx'

export default function LanguageManagement() {
  const [languages, setLanguages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingLanguage, setEditingLanguage] = useState(null)

  useEffect(() => {
    loadLanguages()
  }, [])

  async function loadLanguages() {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/languages')
      setLanguages(data)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleEnabled(language) {
    setError('')
    try {
      await api.patch(`/admin/languages/${language.id}/enabled`, { enabled: !language.enabled })
      await loadLanguages()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update this language.')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this language? Candidates will no longer be able to select it.')) return
    setError('')
    try {
      await api.delete(`/admin/languages/${id}`)
      await loadLanguages()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete this language.')
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <PageHeader
        icon={Code2}
        title="Programming Languages"
        subtitle="Configure which languages candidates and interviewers can use to run code."
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/admin/languages/playground"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <PlayCircle size={16} /> Playground
            </Link>
            <button
              type="button"
              onClick={() => {
                setEditingLanguage(null)
                setShowForm(true)
              }}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Plus size={16} /> Add language
            </button>
          </div>
        }
      />

      {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading languages...</p>}
        {!loading && languages.length === 0 && (
          <p className="text-sm text-slate-500">No languages configured yet.</p>
        )}
        {languages.map((language) => (
          <div key={language.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">{language.displayName}</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  {language.pistonLanguage} &middot; {language.pistonVersion}
                </p>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={language.enabled}
                  onChange={() => handleToggleEnabled(language)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
                />
                {language.enabled ? 'Enabled' : 'Disabled'}
              </label>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingLanguage(language)
                  setShowForm(true)
                }}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(language.id)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <LanguageFormModal
          language={editingLanguage}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false)
            loadLanguages()
          }}
        />
      )}
    </section>
  )
}

function LanguageFormModal({ language, onClose, onSaved }) {
  const isEdit = Boolean(language)
  const [runtimes, setRuntimes] = useState([])
  const [runtimesError, setRuntimesError] = useState('')
  const [selectedRuntimeKey, setSelectedRuntimeKey] = useState('')
  const [form, setForm] = useState({
    displayName: language?.displayName || '',
    pistonLanguage: language?.pistonLanguage || '',
    pistonVersion: language?.pistonVersion || '',
    monacoLanguageId: language?.monacoLanguageId || '',
    defaultTemplate: language?.defaultTemplate || '',
    enabled: language?.enabled ?? true,
    displayOrder: language?.displayOrder ?? 0,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/admin/languages/available-runtimes')
      .then(({ data }) => setRuntimes(data))
      .catch((err) =>
        setRuntimesError(
          err.response?.data?.message ||
            'Could not reach the code execution service - you can still type the language/version manually.',
        ),
      )
  }, [])

  function handleRuntimeSelect(key) {
    setSelectedRuntimeKey(key)
    const runtime = runtimes.find((r) => `${r.language}::${r.version}` === key)
    if (runtime) {
      setForm((prev) => ({
        ...prev,
        pistonLanguage: runtime.language,
        pistonVersion: runtime.version,
        displayName: prev.displayName || `${runtime.language} ${runtime.version}`,
        monacoLanguageId: prev.monacoLanguageId || runtime.language,
      }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const payload = { ...form, displayOrder: Number(form.displayOrder) }
    try {
      if (isEdit) {
        await api.put(`/admin/languages/${language.id}`, payload)
      } else {
        await api.post('/admin/languages', payload)
      }
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this language.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Edit language' : 'Add language'}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {error && <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}
          {runtimesError && <div className="rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-700">{runtimesError}</div>}

          {!isEdit && runtimes.length > 0 && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Pick an installed runtime</span>
              <select
                value={selectedRuntimeKey}
                onChange={(e) => handleRuntimeSelect(e.target.value)}
                className="input"
              >
                <option value="">Select a runtime...</option>
                {runtimes.map((r) => (
                  <option key={`${r.language}::${r.version}`} value={`${r.language}::${r.version}`}>
                    {r.language} {r.version}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Display name</span>
            <input
              required
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="input"
              placeholder="Python 3"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Piston language</span>
              <input
                required
                value={form.pistonLanguage}
                onChange={(e) => setForm({ ...form, pistonLanguage: e.target.value })}
                className="input"
                placeholder="python"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Piston version</span>
              <input
                required
                value={form.pistonVersion}
                onChange={(e) => setForm({ ...form, pistonVersion: e.target.value })}
                className="input"
                placeholder="3.10.0"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Monaco/editor language id</span>
              <input
                value={form.monacoLanguageId}
                onChange={(e) => setForm({ ...form, monacoLanguageId: e.target.value })}
                className="input"
                placeholder="python"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Display order</span>
              <input
                type="number"
                min={0}
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                className="input"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Default starter template</span>
            <textarea
              value={form.defaultTemplate}
              onChange={(e) => setForm({ ...form, defaultTemplate: e.target.value })}
              className="input min-h-24 font-mono text-xs"
              placeholder={'print("Hello, world!")'}
            />
          </label>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
            />
            Enabled
          </label>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Language'}
            </button>
            <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
