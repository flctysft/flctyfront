import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import api from '../../lib/api.js'
import BackLink from '../../components/BackLink.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import { titleCase } from '../../lib/format.js'

const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']

const emptyForm = {
  title: '',
  description: '',
  location: '',
  jobType: 'FULL_TIME',
  minSalary: '',
  maxSalary: '',
  skills: '',
  numberOfOpenings: 1,
}

export default function JobForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    api.get(`/jobs/${id}`).then(({ data }) => {
      setForm({
        title: data.title,
        description: data.description,
        location: data.location,
        jobType: data.jobType,
        minSalary: data.minSalary ?? '',
        maxSalary: data.maxSalary ?? '',
        skills: (data.skills || []).join(', '),
        numberOfOpenings: data.numberOfOpenings ?? 1,
      })
    }).finally(() => setLoading(false))
  }, [id, isEdit])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const payload = {
      title: form.title,
      description: form.description,
      location: form.location,
      jobType: form.jobType,
      minSalary: form.minSalary === '' ? null : Number(form.minSalary),
      maxSalary: form.maxSalary === '' ? null : Number(form.maxSalary),
      skills: form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      numberOfOpenings: form.numberOfOpenings === '' ? 1 : Number(form.numberOfOpenings),
    }
    try {
      if (isEdit) {
        await api.put(`/employer/jobs/${id}`, payload)
      } else {
        await api.post('/employer/jobs', payload)
      }
      navigate('/employer/jobs')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this job.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-2xl px-6 py-16 text-center text-slate-500">Loading job...</div>
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      <BackLink to="/employer/jobs" label="Back to my jobs" />
      <div className="mt-4">
        <PageHeader
          icon={Briefcase}
          title={isEdit ? 'Edit Job Posting' : 'Post a New Job'}
          subtitle={isEdit ? 'Update the details candidates will see.' : 'Fill in the details for your new job posting.'}
        />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {error && <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}

        <Field label="Job title">
          <input required maxLength={150} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
        </Field>

        <Field label="Description">
          <textarea required maxLength={4000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-32" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Location">
            <input required maxLength={150} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input" />
          </Field>
          <Field label="Job type">
            <select value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })} className="input">
              {JOB_TYPES.map((type) => (
                <option key={type} value={type}>{titleCase(type)}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Min salary">
            <input type="number" min={0} value={form.minSalary} onChange={(e) => setForm({ ...form, minSalary: e.target.value })} className="input" />
          </Field>
          <Field label="Max salary">
            <input type="number" min={0} value={form.maxSalary} onChange={(e) => setForm({ ...form, maxSalary: e.target.value })} className="input" />
          </Field>
        </div>

        <Field label="Number of openings">
          <input
            required
            type="number"
            min={1}
            value={form.numberOfOpenings}
            onChange={(e) => setForm({ ...form, numberOfOpenings: e.target.value })}
            className="input max-w-[8rem]"
          />
          <span className="mt-1.5 block text-xs text-slate-400">
            This posting closes automatically once this many candidates have been hired.
          </span>
        </Field>

        <Field label="Skills (comma separated)">
          <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, Node.js, SQL" className="input" />
        </Field>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Post Job'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/employer/jobs')}
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
