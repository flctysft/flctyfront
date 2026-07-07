import { NavLink } from 'react-router-dom'
import { Target, Heart, Sparkles, Globe2, ArrowRight } from 'lucide-react'

const stats = [
  { label: 'Founded', value: '2019' },
  { label: 'Team Members', value: '86' },
  { label: 'Countries Served', value: '24' },
  { label: 'Jobs Filled', value: '48,000+' },
]

const values = [
  {
    icon: Target,
    title: 'Purposeful matching',
    description: 'We measure success by fit, not just fills — the right role for the right person, every time.',
  },
  {
    icon: Heart,
    title: 'People first',
    description: 'Behind every application and every job post is a person. We build with empathy at the core.',
  },
  {
    icon: Sparkles,
    title: 'Relentless simplicity',
    description: 'Hiring is stressful enough. We strip away the clutter so both sides can focus on what matters.',
  },
  {
    icon: Globe2,
    title: 'Open opportunity',
    description: 'Great talent exists everywhere. We work to make opportunity accessible, wherever you are.',
  },
]

const timeline = [
  { year: '2019', title: 'HireHub founded', description: 'Started as a small team trying to fix broken job boards.' },
  { year: '2021', title: 'Smart matching launched', description: 'Introduced AI-assisted matching to cut hiring time in half.' },
  { year: '2023', title: '1 million users', description: 'Crossed a million registered candidates and employers.' },
  { year: '2026', title: 'Global expansion', description: 'Now serving employers and candidates in 24 countries.' },
]

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
        <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
            About HireHub
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Hiring, reimagined for{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              real people
            </span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            We started HireHub because job hunting and hiring were both broken —
            slow, impersonal, and full of noise. Today we help thousands of
            companies and candidates find each other, faster and better.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-6 rounded-3xl border border-slate-200 p-10 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
              <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Our mission
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              To make finding the right job — or the right hire — feel less like
              a search and more like a match. We believe great teams are built
              when the right people find the right opportunities without
              friction, bias, or wasted time.
            </p>
            <p className="mt-4 leading-relaxed text-slate-600">
              Every feature we build starts with one question: does this get a
              candidate closer to an offer, or an employer closer to their next
              great hire? If not, it doesn't ship.
            </p>
            <NavLink
              to="/"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Explore open roles
              <ArrowRight size={16} />
            </NavLink>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-indigo-600 p-6 text-white">
              <div className="text-2xl font-bold">98%</div>
              <div className="mt-1 text-sm text-indigo-100">
                Employer satisfaction rate
              </div>
            </div>
            <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="text-2xl font-bold text-slate-900">9 days</div>
              <div className="mt-1 text-sm text-slate-500">
                Average time to hire
              </div>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="text-2xl font-bold text-slate-900">24</div>
              <div className="mt-1 text-sm text-slate-500">
                Countries served
              </div>
            </div>
            <div className="mt-8 rounded-2xl bg-violet-600 p-6 text-white">
              <div className="text-2xl font-bold">48k+</div>
              <div className="mt-1 text-sm text-violet-100">
                Successful placements
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            What we stand for
          </h2>
          <p className="mt-3 text-slate-600">
            The principles that guide every product decision we make.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {values.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex gap-4 rounded-2xl border border-slate-200 p-6 transition hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icon size={22} />
              </span>
              <div>
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Our journey
            </h2>
          </div>

          <div className="mt-14 space-y-10 border-l-2 border-indigo-200 pl-8">
            {timeline.map((item) => (
              <div key={item.year} className="relative">
                <span className="absolute -left-[41px] flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 ring-4 ring-slate-50" />
                <div className="text-sm font-semibold text-indigo-600">
                  {item.year}
                </div>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-8 py-16 text-center shadow-xl">
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/10" />
          <h2 className="relative text-3xl font-bold text-white sm:text-4xl">
            Join us on the mission
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-indigo-100">
            Whether you're hiring your next teammate or looking for your next
            role, HireHub is built for you.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <NavLink
              to="/"
              className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
            >
              Get Started
              <ArrowRight size={16} />
            </NavLink>
          </div>
        </div>
      </section>
    </>
  )
}
