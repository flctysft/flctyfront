import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MapPin, Briefcase, Users } from 'lucide-react'
import api from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import BackLink from '../components/BackLink.jsx'
import { formatDate, formatSalary, titleCase } from '../lib/format.js'

export default function JobDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [coverLetter, setCoverLetter] = useState('')
  const [applying, setApplying] = useState(false)
  const [existingApplication, setExistingApplication] = useState(null)
  const [checkingApplication, setCheckingApplication] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/jobs/${id}`).then(({ data }) => setJob(data)).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!user || user.role !== 'CANDIDATE') {
      setCheckingApplication(false)
      return
    }
    let cancelled = false
    api
      .get('/candidate/applications')
      .then(({ data }) => {
        if (cancelled) return
        const existing = data.find((app) => String(app.jobId) === String(id))
        if (existing) setExistingApplication(existing)
      })
      .finally(() => {
        if (!cancelled) setCheckingApplication(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, user])

  async function handleApply(e) {
    e.preventDefault()
    setError('')
    setApplying(true)
    try {
      const { data } = await api.post(`/jobs/${id}/apply`, { coverLetter })
      setExistingApplication(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit your application.')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-3xl px-6 py-16 text-center text-slate-500">Loading job...</div>
  }

  if (!job) {
    return <div className="mx-auto max-w-3xl px-6 py-16 text-center text-slate-500">Job not found.</div>
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <BackLink to="/jobs" label="Back to jobs" />

      <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{job.employerName}</p>
          </div>
          <span className="whitespace-nowrap rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {titleCase(job.jobType)}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1.5"><MapPin size={14} /> {job.location}</span>
          <span className="flex items-center gap-1.5"><Briefcase size={14} /> {formatSalary(job.minSalary, job.maxSalary)}</span>
          {job.numberOfOpenings > 1 && (
            <span className="flex items-center gap-1.5"><Users size={14} /> {job.numberOfOpenings} openings</span>
          )}
        </div>

        {job.skills?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {job.skills.map((skill) => (
              <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {skill}
              </span>
            ))}
          </div>
        )}

        <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-slate-700">{job.description}</p>
        <p className="mt-6 text-xs text-slate-400">Posted {formatDate(job.createdAt)}</p>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        {!user && (
          <p className="text-sm text-slate-600">
            <button onClick={() => navigate('/login')} className="font-semibold text-indigo-600 hover:text-indigo-700">
              Sign in
            </button>{' '}
            as a candidate to apply for this job.
          </p>
        )}

        {user && user.role !== 'CANDIDATE' && (
          <p className="text-sm text-slate-500">Only candidate accounts can apply to jobs.</p>
        )}

        {user && user.role === 'CANDIDATE' && checkingApplication && (
          <p className="text-sm text-slate-500">Checking your application status...</p>
        )}

        {user && user.role === 'CANDIDATE' && !checkingApplication && existingApplication && (
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              You've already applied to this job &mdash; status: {titleCase(existingApplication.status)}.
            </p>
            <Link
              to="/candidate/applications"
              className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View your application
            </Link>
          </div>
        )}

        {user && user.role === 'CANDIDATE' && !checkingApplication && !existingApplication && (
          <form onSubmit={handleApply} className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">Apply for this job</h2>
            {error && <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Add a cover letter (optional)"
              className="input min-h-32"
            />
            <button
              type="submit"
              disabled={applying}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {applying ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
