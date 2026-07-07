import { NavLink } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import SocialIcon from './SocialIcons.jsx'

const footerLinks = {
  Candidates: ['Browse Jobs', 'Career Advice', 'Resume Builder', 'Salary Guide'],
  Employers: ['Post a Job', 'Pricing Plans', 'Talent Search', 'Success Stories'],
  Company: ['About Us', 'Contact', 'Careers', 'Press'],
}

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <Briefcase size={18} />
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Hire<span className="text-indigo-600">Hub</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">
              Connecting great talent with great companies. HireHub makes hiring
              faster, simpler, and smarter for everyone.
            </p>
            <div className="mt-6 flex gap-3">
              {['facebook', 'twitter', 'instagram', 'linkedin'].map((name) => (
                <a
                  key={name}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200 transition hover:text-indigo-600 hover:ring-indigo-300"
                >
                  <SocialIcon name={name} size={16} />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([heading, items]) => (
            <div key={heading}>
              <h3 className="text-sm font-semibold text-slate-900">{heading}</h3>
              <ul className="mt-4 space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-slate-600 transition hover:text-indigo-600"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} HireHub. All rights reserved.
          </p>
          <div className="flex gap-6">
            <NavLink to="/about" className="text-sm text-slate-500 hover:text-indigo-600">
              About
            </NavLink>
            <a href="#" className="text-sm text-slate-500 hover:text-indigo-600">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-slate-500 hover:text-indigo-600">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
