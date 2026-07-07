import { titleCase } from '../lib/format.js'

export default function StatusBadge({ status, styles }) {
  const className = styles[status] || 'bg-slate-100 text-slate-700'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      {titleCase(status)}
    </span>
  )
}
