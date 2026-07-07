import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Code2 } from 'lucide-react'
import api from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import PageHeader from '../../components/PageHeader.jsx'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [languageCount, setLanguageCount] = useState(null)

  useEffect(() => {
    api
      .get('/admin/languages')
      .then(({ data }) => setLanguageCount(data.length))
      .catch(() => setLanguageCount(null))
  }, [])

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <PageHeader
        icon={LayoutDashboard}
        title={`Welcome back, ${user.fullName.split(' ')[0]}`}
        subtitle="Platform administration."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          to="/admin/languages"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Code2 size={18} />
          </span>
          <p className="mt-3 text-2xl font-bold text-slate-900">{languageCount ?? '-'}</p>
          <p className="text-sm text-slate-500">Languages configured</p>
        </Link>
      </div>
    </section>
  )
}
