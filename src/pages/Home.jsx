import { NavLink } from 'react-router-dom'
import {
  Search,
  MapPin,
  ArrowRight,
  Code2,
  Palette,
  LineChart,
  Megaphone,
  HeadphonesIcon,
  Wallet,
  ShieldCheck,
  Zap,
  Users,
  Star,
} from 'lucide-react'

const stats = [
  { label: 'Active Job Listings', value: '12,400+' },
  { label: 'Companies Hiring', value: '3,200+' },
  { label: 'Candidates Placed', value: '48,000+' },
  { label: 'Avg. Time to Hire', value: '9 days' },
]

const categories = [
  { icon: Code2, name: 'Engineering', jobs: '2,180 jobs' },
  { icon: Palette, name: 'Design', jobs: '860 jobs' },
  { icon: LineChart, name: 'Finance', jobs: '740 jobs' },
  { icon: Megaphone, name: 'Marketing', jobs: '1,020 jobs' },
  { icon: HeadphonesIcon, name: 'Customer Support', jobs: '530 jobs' },
  { icon: Wallet, name: 'Sales', jobs: '910 jobs' },
]

const steps = [
  {
    title: 'Create your profile',
    description: 'Build a standout profile or company page in minutes — no fluff, just what recruiters need.',
  },
  {
    title: 'Match & apply',
    description: 'Our matching engine surfaces roles and candidates that actually fit, not just keyword hits.',
  },
  {
    title: 'Hire with confidence',
    description: 'Message, schedule, and close offers in one place, with everyone kept in the loop.',
  },
]

const features = [
  {
    icon: Zap,
    title: 'Fast, smart matching',
    description: 'AI-assisted matching connects the right people to the right roles in record time.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified employers',
    description: 'Every company on HireHub is vetted, so you only apply to real, active opportunities.',
  },
  {
    icon: Users,
    title: 'Built for teams',
    description: 'Collaborative hiring tools let your whole team review, comment, and decide together.',
  },
]

const testimonials = [
  {
    quote: 'HireHub cut our time-to-hire in half. The quality of candidates coming through was night and day.',
    name: 'Ananya Rao',
    role: 'Head of Talent, Nimbus Labs',
  },
  {
    quote: 'I found a role that actually matched my skills within a week of signing up. No spam, no noise.',
    name: 'Devraj Singh',
    role: 'Senior Product Designer',
  },
  {
    quote: 'The dashboard makes it so easy to track every candidate across every open req we have.',
    name: 'Priya Menon',
    role: 'HR Manager, Solstice Retail',
  },
]

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
        <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
              <Star size={14} className="fill-indigo-700 text-indigo-700" />
              Trusted by 3,200+ companies worldwide
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Find your next hire, or your next{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                great opportunity
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              HireHub connects ambitious talent with companies that are building
              something worth joining. Smarter matching, faster hiring, zero noise.
            </p>

            {/* Search bar */}
            <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/50 sm:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5">
                <Search size={18} className="shrink-0 text-slate-400" />
                <input
                  type="text"
                  placeholder="Job title or keyword"
                  className="w-full border-0 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <div className="hidden w-px bg-slate-200 sm:block" />
              <div className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5">
                <MapPin size={18} className="shrink-0 text-slate-400" />
                <input
                  type="text"
                  placeholder="City or remote"
                  className="w-full border-0 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Search Jobs
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500">
              <span>Popular:</span>
              {['Product Designer', 'Backend Engineer', 'Data Analyst', 'Sales Lead'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-3 py-1 text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Explore by category
          </h2>
          <p className="mt-3 text-slate-600">
            Browse thousands of open roles across the fields companies are hiring for right now.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(({ icon: Icon, name, jobs }) => (
            <a
              key={name}
              href="#"
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-5 transition hover:border-indigo-300 hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                <Icon size={22} />
              </span>
              <div>
                <div className="font-semibold text-slate-900">{name}</div>
                <div className="text-sm text-slate-500">{jobs}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              How HireHub works
            </h2>
            <p className="mt-3 text-slate-600">
              Three simple steps, whether you're hiring or looking to be hired.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white shadow-lg shadow-indigo-200">
                  {i + 1}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Why teams choose HireHub
          </h2>
          <p className="mt-3 text-slate-600">
            Everything you need to hire well, without the busywork.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 p-8 transition hover:shadow-md"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <Icon size={22} />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Loved by candidates and recruiters alike
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400" />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-8 py-16 text-center shadow-xl">
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <h2 className="relative text-3xl font-bold text-white sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-indigo-100">
            Join thousands of companies and candidates already hiring and getting hired on HireHub.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50">
              Find a Job
              <ArrowRight size={16} />
            </button>
            <NavLink
              to="/about"
              className="flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Learn More
            </NavLink>
          </div>
        </div>
      </section>
    </>
  )
}
