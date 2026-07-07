import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Users, MapPin, Briefcase } from 'lucide-react'
import api from '../../lib/api.js'
import StatusBadge from '../../components/StatusBadge.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import { JOB_STATUS_STYLES, formatSalary, titleCase } from '../../lib/format.js'

export default function MyJobs() {
  const [jobsPage, setJobsPage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadJobs()
  }, [])

  async function loadJobs() {
    setLoading(true)
    try {
      const { data } = await api.get('/employer/jobs', { params: { size: 50 } })
      setJobsPage(data)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this job posting? This cannot be undone.')) return
    await api.delete(`/employer/jobs/${id}`)
    await loadJobs()
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <PageHeader
        icon={Briefcase}
        title="My Job Postings"
        subtitle="Manage the jobs you've posted."
        actions={
          <Link
            to="/employer/jobs/new"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus size={16} /> Post a Job
          </Link>
        }
      />

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading jobs...</p>}
        {!loading && jobsPage?.content.length === 0 && (
          <p className="text-sm text-slate-500">You haven't posted any jobs yet.</p>
        )}
        {jobsPage?.content.map((job) => (
          <div key={job.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-slate-900">{job.title}</h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin size={14} /> {job.location} · {titleCase(job.jobType)} · {formatSalary(job.minSalary, job.maxSalary)}
                  {job.numberOfOpenings > 1 && ` · ${job.numberOfOpenings} openings`}
                </p>
              </div>
              <StatusBadge status={job.status} styles={JOB_STATUS_STYLES} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to={`/employer/jobs/${job.id}/applicants`}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Users size={14} /> View Applicants
              </Link>
              <Link
                to={`/employer/jobs/${job.id}/edit`}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Pencil size={14} /> Edit
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(job.id)}
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
