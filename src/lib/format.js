export function titleCase(value) {
  if (!value) return ''
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatSalary(min, max) {
  if (!min && !max) return 'Not disclosed'
  const fmt = (n) => `$${Number(n).toLocaleString()}`
  if (min && max) return `${fmt(min)} - ${fmt(max)}`
  return fmt(min || max)
}

export const APPLICATION_STATUS_STYLES = {
  APPLIED: 'bg-slate-100 text-slate-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  SELECTED: 'bg-indigo-100 text-indigo-700',
  TERMS_ACCEPTED: 'bg-indigo-100 text-indigo-700',
  OFFER_SENT: 'bg-purple-100 text-purple-700',
  OFFER_ACCEPTED: 'bg-emerald-100 text-emerald-700',
  OFFER_DECLINED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-slate-100 text-slate-700',
  HIRED: 'bg-emerald-100 text-emerald-700',
}

export const INTERVIEW_STATUS_STYLES = {
  SCHEDULED: 'bg-amber-100 text-amber-700',
  ACCEPTED: 'bg-emerald-100 text-emerald-700',
  DECLINED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-slate-100 text-slate-700',
}

export const JOB_STATUS_STYLES = {
  OPEN: 'bg-emerald-100 text-emerald-700',
  CLOSED: 'bg-slate-100 text-slate-700',
}

export const INTERVIEW_TYPES = ['HR', 'TECHNICAL', 'MANAGERIAL', 'FINAL_ROUND', 'OTHER']

export const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Moscow',
  'Africa/Lagos',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Australia/Sydney',
  'Pacific/Auckland',
]

export function browserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'UTC'
  }
}
