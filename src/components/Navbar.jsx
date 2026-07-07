import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Briefcase, Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import NotificationBell from './NotificationBell.jsx'

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/about', label: 'About' },
]

const candidateLinks = [
  { to: '/candidate/dashboard', label: 'Dashboard' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/candidate/applications', label: 'Applications' },
  { to: '/candidate/interviews', label: 'Interviews' },
  { to: '/candidate/coding-tests', label: 'Coding Tests' },
  { to: '/candidate/profile', label: 'Profile' },
]

const employerLinks = [
  { to: '/employer/dashboard', label: 'Dashboard' },
  { to: '/employer/jobs', label: 'My Jobs' },
  { to: '/employer/candidates', label: 'Candidates' },
  { to: '/employer/coding-tests', label: 'Coding Tests' },
  { to: '/employer/coding-questions', label: 'Coding Questions' },
]

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/languages', label: 'Languages' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const links = user
    ? user.role === 'ADMIN'
      ? adminLinks
      : user.role === 'EMPLOYER'
        ? employerLinks
        : candidateLinks
    : publicLinks

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'
    }`

  function handleLogout() {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Briefcase size={18} />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Hire<span className="text-indigo-600">Hub</span>
          </span>
        </NavLink>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass} end>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <NotificationBell />
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                {user.fullName?.charAt(0)}
              </span>
              <span className="text-sm font-medium text-slate-700">
                {user.fullName}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:text-indigo-600"
              >
                <LogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:text-indigo-600"
              >
                Sign In
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700"
              >
                Get Started
              </NavLink>
            </>
          )}
        </div>

        <button
          type="button"
          className="text-slate-700 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={linkClass}
                end
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <hr className="border-slate-200" />
            {user ? (
              <>
                <span className="text-sm font-medium text-slate-700">
                  Signed in as {user.fullName}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-left text-sm font-semibold text-slate-700"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="text-left text-sm font-semibold text-slate-700"
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white"
                >
                  Get Started
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
