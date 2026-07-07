import { NavLink } from 'react-router-dom'

export default function CompactFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-4 text-xs text-slate-500 sm:flex-row lg:px-8">
        <p>&copy; {new Date().getFullYear()} HireHub. All rights reserved.</p>
        <div className="flex gap-4">
          <NavLink to="/about" className="hover:text-indigo-600">
            About
          </NavLink>
          <a href="#" className="hover:text-indigo-600">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-indigo-600">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  )
}
