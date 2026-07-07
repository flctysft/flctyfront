import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function BackLink({ to, label }) {
  return (
    <Link to={to} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-indigo-600">
      <ArrowLeft size={15} /> {label}
    </Link>
  )
}
