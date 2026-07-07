import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Plus, Users, LayoutDashboard } from 'lucide-react'
import api from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import { JOB_STATUS_STYLES, formatSalary, titleCase } from '../../lib/format.js'

export default function EmployerDashboard() {
  const { user } = useAuth()
  const [jobsPage, setJobsPage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/employer/jobs', { params: { size: 5 } }).then(({ data }) => setJobsPage(data)).finally(() => setLoading(false))
  }, [])

  const openJobs = jobsPage?.content.filter((j) => j.status === 'OPEN').length ?? 0

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <PageHeader
        icon={LayoutDashboard}
        title={`Welcome back, ${user.fullName.split(' ')[0]}`}
        subtitle="Manage your job postings and applicants."
        actions={
          <Link
            to="/employer/jobs/new"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus size={16} /> Post a Job
          </Link>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatCard icon={Briefcase} label="Open jobs" value={loading ? '-' : openJobs} to="/employer/jobs" />
        <StatCard icon={Users} label="Total postings" value={loading ? '-' : jobsPage?.totalElements ?? 0} to="/employer/jobs" />
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent job postings</h2>
          <Link to="/employer/jobs" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View all</Link>
        </div>
        {!loading && jobsPage?.content.length === 0 && (
          <p className="mt-3 text-sm text-slate-500">You haven't posted any jobs yet.</p>
        )}
        <div className="mt-4 space-y-3">
          {jobsPage?.content.map((job) => (
            <Link
              key={job.id}
              to={`/employer/jobs/${job.id}/applicants`}
              className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">{job.title}</p>
                <p className="text-sm text-slate-500">{job.location} · {titleCase(job.jobType)} · {formatSalary(job.minSalary, job.maxSalary)}</p>
              </div>
              <StatusBadge status={job.status} styles={JOB_STATUS_STYLES} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatCard({ icon: Icon, label, value, to }) {
  return (
    <Link to={to} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon size={18} />
      </span>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </Link>
  )
}
