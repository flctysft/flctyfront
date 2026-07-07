import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, CalendarClock, UserCircle, Search, Gift, LayoutDashboard } from 'lucide-react'
import api from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import { formatDateTime } from '../../lib/format.js'

export default function CandidateDashboard() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/candidate/applications'),
      api.get('/candidate/interviews'),
    ]).then(([appsRes, interviewsRes]) => {
      setApplications(appsRes.data)
      setInterviews(interviewsRes.data)
    }).finally(() => setLoading(false))
  }, [])

  const upcomingInterviews = interviews
    .filter((i) => i.status === 'SCHEDULED' || i.status === 'ACCEPTED')
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
    .slice(0, 3)

  const offersInProgress = applications.filter((a) =>
    ['SELECTED', 'TERMS_ACCEPTED', 'OFFER_SENT', 'OFFER_ACCEPTED'].includes(a.status),
  ).length

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <PageHeader
        icon={LayoutDashboard}
        title={`Welcome back, ${user.fullName.split(' ')[0]}`}
        subtitle="Here's a look at your job search activity."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Applications" value={loading ? '-' : applications.length} to="/candidate/applications" />
        <StatCard icon={CalendarClock} label="Interviews" value={loading ? '-' : interviews.length} to="/candidate/interviews" />
        <StatCard icon={Gift} label="Offers" value={loading ? '-' : offersInProgress} to="/candidate/applications" />
        <StatCard icon={Search} label="Browse Jobs" value="Find roles" to="/jobs" />
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Upcoming interviews</h2>
        {!loading && upcomingInterviews.length === 0 && (
          <p className="mt-2 text-sm text-slate-500">No upcoming interviews.</p>
        )}
        <div className="mt-4 space-y-3">
          {upcomingInterviews.map((interview) => (
            <Link
              key={interview.id}
              to="/candidate/interviews"
              className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <span className="text-sm font-medium text-slate-800">{interview.jobTitle}</span>
              <span className="text-sm text-slate-500">{formatDateTime(interview.scheduledAt)}</span>
            </Link>
          ))}
        </div>
      </div>

      <Link
        to="/candidate/profile"
        className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/40 p-5 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
      >
        <UserCircle size={20} />
        Keep your profile complete to stand out to employers
      </Link>
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
