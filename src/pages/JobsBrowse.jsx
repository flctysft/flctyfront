import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Briefcase } from 'lucide-react'
import api from '../lib/api.js'
import PageHeader from '../components/PageHeader.jsx'
import { formatSalary, titleCase } from '../lib/format.js'

const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']

export default function JobsBrowse() {
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState('')
  const [page, setPage] = useState(0)
  const [jobsPage, setJobsPage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadJobs()
  }, [page])

  async function loadJobs(e) {
    if (e) e.preventDefault()
    setLoading(true)
    setPage(e ? 0 : page)
    try {
      const { data } = await api.get('/jobs', {
        params: {
          keyword: keyword || undefined,
          location: location || undefined,
          jobType: jobType || undefined,
          page: e ? 0 : page,
          size: 10,
        },
      })
      setJobsPage(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <PageHeader
        icon={Search}
        title="Find your next role"
        subtitle="Browse open positions from employers on HireHub."
      />

      <form onSubmit={loadJobs} className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 sm:col-span-2">
          <Search size={16} className="shrink-0 text-slate-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Job title or keyword"
            className="w-full border-0 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5">
          <MapPin size={16} className="shrink-0 text-slate-400" />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="w-full border-0 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="input">
          <option value="">All job types</option>
          {JOB_TYPES.map((type) => (
            <option key={type} value={type}>{titleCase(type)}</option>
          ))}
        </select>
        <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:col-span-4">
          Search
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading jobs...</p>}
        {!loading && jobsPage?.content.length === 0 && (
          <p className="text-sm text-slate-500">No jobs match your search.</p>
        )}
        {!loading && jobsPage?.content.map((job) => (
          <Link
            key={job.id}
            to={`/jobs/${job.id}`}
            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-slate-900">{job.title}</h2>
                <p className="mt-0.5 text-sm text-slate-500">{job.employerName}</p>
              </div>
              <span className="whitespace-nowrap rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {titleCase(job.jobType)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><MapPin size={14} /> {job.location}</span>
              <span className="flex items-center gap-1.5"><Briefcase size={14} /> {formatSalary(job.minSalary, job.maxSalary)}</span>
            </div>
          </Link>
        ))}
      </div>

      {jobsPage && jobsPage.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">Page {page + 1} of {jobsPage.totalPages}</span>
          <button
            type="button"
            disabled={page >= jobsPage.totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </section>
  )
}
