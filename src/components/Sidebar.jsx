import { NavLink } from 'react-router-dom'
import {
  Briefcase,
  LayoutDashboard,
  FileText,
  CalendarClock,
  UserCircle,
  Search,
  Users,
  Code2,
  ClipboardList,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const candidateLinks = [
  { to: '/candidate/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/jobs', label: 'Browse Jobs', icon: Search },
  { to: '/candidate/applications', label: 'Applications', icon: FileText },
  { to: '/candidate/interviews', label: 'Interviews', icon: CalendarClock },
  { to: '/candidate/coding-tests', label: 'Coding Tests', icon: ClipboardList },
  { to: '/candidate/profile', label: 'Profile', icon: UserCircle },
]

const employerLinks = [
  { to: '/employer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employer/jobs', label: 'My Jobs', icon: Briefcase },
  { to: '/employer/candidates', label: 'Candidates', icon: Users },
  { to: '/employer/coding-tests', label: 'Coding Tests', icon: ClipboardList },
  { to: '/employer/coding-questions', label: 'Coding Questions', icon: Code2 },
]

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/languages', label: 'Languages', icon: Code2 },
]

export default function Sidebar() {
  const { user } = useAuth()
  const links =
    user?.role === 'ADMIN' ? adminLinks : user?.role === 'EMPLOYER' ? employerLinks : candidateLinks

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-600'
        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
    }`

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
      <nav className="sticky top-[73px] space-y-1 px-4 py-6">
        <p className="px-3.5 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Menu
        </p>
        {links.map((link) => {
          const Icon = link.icon
          return (
            <NavLink key={link.to} to={link.to} end className={linkClass}>
              <Icon size={18} />
              {link.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
