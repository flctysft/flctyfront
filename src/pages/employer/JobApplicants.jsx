import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronDown,
  ChevronUp,
  CalendarPlus,
  Pencil,
  Trash2,
  Video,
  Copy,
  Plus,
  X,
  UserCheck,
  UserX,
  FileText,
  Download,
  PartyPopper,
  Target,
  List,
  LayoutGrid,
  Users,
} from 'lucide-react'
import api from '../../lib/api.js'
import StatusBadge from '../../components/StatusBadge.jsx'
import RecordingsList from '../../components/RecordingsList.jsx'
import BackLink from '../../components/BackLink.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import {
  APPLICATION_STATUS_STYLES,
  INTERVIEW_STATUS_STYLES,
  INTERVIEW_TYPES,
  TIMEZONES,
  browserTimezone,
  formatDate,
  formatDateTime,
  titleCase,
} from '../../lib/format.js'

const APPLICATION_STATUSES = ['APPLIED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED']
const INTERVIEW_MODES = ['ONLINE', 'IN_PERSON', 'PHONE']
const REFRESH_MS = 15000
const OFFER_PROCESS_STATUSES = [
  'SELECTED',
  'TERMS_ACCEPTED',
  'OFFER_SENT',
  'OFFER_ACCEPTED',
  'HIRED',
  'OFFER_DECLINED',
  'WITHDRAWN',
]

export default function JobApplicants() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const [statusError, setStatusError] = useState('')

  useEffect(() => {
    loadApplications()
    const interval = setInterval(() => loadApplications({ silent: true }), REFRESH_MS)
    return () => clearInterval(interval)
  }, [jobId])

  async function loadApplications({ silent = false } = {}) {
    if (!silent) setLoading(true)
    try {
      const { data } = await api.get(`/employer/jobs/${jobId}/applications`)
      setApplications(data)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  async function updateStatus(applicationId, status) {
    setStatusError('')
    try {
      await api.patch(`/employer/applications/${applicationId}/status`, { status })
      await loadApplications()
    } catch (err) {
      setStatusError(err.response?.data?.message || 'Could not update this application’s status.')
    }
  }

  function goToApplicant(applicationId) {
    setViewMode('list')
    setExpandedId(applicationId)
  }

  return (
    <section className={`mx-auto px-6 py-12 ${viewMode === 'board' ? 'max-w-6xl' : 'max-w-4xl'}`}>
      <BackLink to="/employer/jobs" label="Back to my jobs" />

      <div className="mt-4">
        <PageHeader
          icon={Users}
          title="Applicants"
          subtitle="Review candidates and manage their application status."
          actions={
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                  viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-indigo-600'
                }`}
              >
                <List size={14} /> List
              </button>
              <button
                type="button"
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                  viewMode === 'board' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-indigo-600'
                }`}
              >
                <LayoutGrid size={14} /> Board
              </button>
            </div>
          }
        />
      </div>

      {statusError && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{statusError}</div>
      )}

      {loading && <p className="mt-6 text-sm text-slate-500">Loading applicants...</p>}
      {!loading && applications.length === 0 && (
        <p className="mt-6 text-sm text-slate-500">No applications yet for this job.</p>
      )}

      {!loading && applications.length > 0 && viewMode === 'list' && (
        <div className="mt-6 space-y-3">
          {applications.map((app) => (
            <ApplicantCard
              key={app.id}
              application={app}
              expanded={expandedId === app.id}
              onToggle={() => setExpandedId(expandedId === app.id ? null : app.id)}
              onStatusChange={(status) => updateStatus(app.id, status)}
              onRefresh={loadApplications}
            />
          ))}
        </div>
      )}

      {!loading && applications.length > 0 && viewMode === 'board' && (
        <ApplicantBoard applications={applications} onStatusChange={updateStatus} onSelectApplication={goToApplicant} />
      )}
    </section>
  )
}

function ApplicantBoard({ applications, onStatusChange, onSelectApplication }) {
  const [dragOverColumn, setDragOverColumn] = useState(null)

  const columns = APPLICATION_STATUSES.map((status) => ({
    status,
    label: titleCase(status),
    apps: applications.filter((app) => app.status === status),
    draggable: true,
  }))
  columns.push({
    status: 'OFFER_PROCESS',
    label: 'In Offer Process',
    apps: applications.filter((app) => OFFER_PROCESS_STATUSES.includes(app.status)),
    draggable: false,
  })

  function handleDrop(e, status) {
    e.preventDefault()
    setDragOverColumn(null)
    const applicationId = Number(e.dataTransfer.getData('text/plain'))
    if (applicationId) onStatusChange(applicationId, status)
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {columns.map((column) => (
        <div
          key={column.status}
          onDragOver={(e) => {
            if (!column.draggable) return
            e.preventDefault()
            setDragOverColumn(column.status)
          }}
          onDragLeave={() => setDragOverColumn(null)}
          onDrop={(e) => column.draggable && handleDrop(e, column.status)}
          className={`rounded-2xl border p-3 transition ${
            dragOverColumn === column.status
              ? 'border-indigo-400 bg-indigo-50/60'
              : 'border-slate-200 bg-slate-50/60'
          }`}
        >
          <p className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-500">
            {column.label}
            <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600">
              {column.apps.length}
            </span>
          </p>
          <div className="space-y-2">
            {column.apps.map((app) => (
              <div
                key={app.id}
                draggable={column.draggable}
                onDragStart={(e) => e.dataTransfer.setData('text/plain', String(app.id))}
                onClick={() => onSelectApplication(app.id)}
                className={`rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm transition hover:border-indigo-300 hover:shadow-md ${
                  column.draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                }`}
              >
                <p className="font-semibold text-slate-800">{app.candidateName}</p>
                {!column.draggable && (
                  <p className="mt-1 text-xs text-slate-500">{titleCase(app.status)}</p>
                )}
                {app.skillMatchPercent != null && (
                  <span
                    className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${skillMatchClass(app.skillMatchPercent)}`}
                  >
                    <Target size={9} /> {app.skillMatchPercent}%
                  </span>
                )}
              </div>
            ))}
            {column.apps.length === 0 && (
              <p className="text-xs text-slate-400">No applicants</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function skillMatchClass(percent) {
  if (percent >= 70) return 'bg-emerald-100 text-emerald-700'
  if (percent >= 40) return 'bg-amber-100 text-amber-700'
  return 'bg-slate-100 text-slate-600'
}

function ApplicantCard({ application, expanded, onToggle, onStatusChange, onRefresh }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-900">{application.candidateName}</p>
          <p className="mt-0.5 text-sm text-slate-500">Applied {formatDate(application.appliedAt)}</p>
          {application.skillMatchPercent != null && (
            <span
              className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${skillMatchClass(application.skillMatchPercent)}`}
            >
              <Target size={10} /> {application.skillMatchPercent}% skill match
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={application.status} styles={APPLICATION_STATUS_STYLES} />
          <select
            value={application.status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600"
          >
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>{titleCase(status)}</option>
            ))}
          </select>
        </div>
      </div>

      {application.coverLetter && (
        <p className="mt-3 whitespace-pre-line text-sm text-slate-600">{application.coverLetter}</p>
      )}

      <button
        type="button"
        onClick={onToggle}
        className="mt-3 flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
      >
        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        {expanded ? 'Hide details' : 'View profile & interviews'}
      </button>

      {expanded && <ApplicantDetails application={application} onRefresh={onRefresh} />}
    </div>
  )
}

function ApplicantDetails({ application, onRefresh }) {
  const applicationId = application.id
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [profileError, setProfileError] = useState('')
  const [interviews, setInterviews] = useState([])
  const [offerLetter, setOfferLetter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [editingInterview, setEditingInterview] = useState(null)
  const [copiedPanelistId, setCopiedPanelistId] = useState(null)
  const [markingSelected, setMarkingSelected] = useState(false)
  const [sendingOffer, setSendingOffer] = useState(false)
  const [downloadingOffer, setDownloadingOffer] = useState(false)
  const [downloadingResume, setDownloadingResume] = useState(false)
  const [markingHired, setMarkingHired] = useState(false)

  useEffect(() => {
    loadDetails()
    // Re-fetch whenever the application's status changes (e.g. the candidate
    // accepts terms in another session and the parent's poll picks it up),
    // not just on first mount, so the offer actions unlock without a manual
    // page refresh.
  }, [applicationId, application.status])

  async function loadDetails() {
    setLoading(true)
    setProfileError('')
    const needsOffer = ['OFFER_SENT', 'OFFER_ACCEPTED'].includes(application.status)
    const tasks = [
      api.get(`/employer/applications/${applicationId}/candidate-profile`),
      api.get(`/employer/applications/${applicationId}/interviews`),
    ]
    if (needsOffer) tasks.push(api.get(`/employer/applications/${applicationId}/offer-letter`))
    const [profileResult, interviewsResult, offerResult] = await Promise.allSettled(tasks)
    if (profileResult.status === 'fulfilled') {
      setProfile(profileResult.value.data)
    } else {
      setProfileError(profileResult.reason.response?.data?.message || 'Candidate has not completed their profile.')
    }
    if (interviewsResult.status === 'fulfilled') {
      setInterviews(interviewsResult.value.data)
    }
    if (needsOffer && offerResult?.status === 'fulfilled') {
      setOfferLetter(offerResult.value.data)
    }
    setLoading(false)
  }

  async function handleDiscard(interviewId) {
    if (!confirm('Discard this scheduled interview?')) return
    await api.delete(`/employer/interviews/${interviewId}`)
    await loadDetails()
  }

  async function handleCopyPanelistInvite(interviewId, panelistId) {
    const { data } = await api.get(`/employer/interviews/${interviewId}/panelists/${panelistId}/invite`)
    await navigator.clipboard.writeText(data.inviteUrl)
    setCopiedPanelistId(panelistId)
    setTimeout(() => setCopiedPanelistId(null), 2000)
  }

  async function handleMarkSelected() {
    setMarkingSelected(true)
    try {
      await api.post(`/employer/applications/${applicationId}/select`)
      onRefresh()
    } finally {
      setMarkingSelected(false)
    }
  }

  async function handleSendOffer() {
    setSendingOffer(true)
    try {
      await api.post(`/employer/applications/${applicationId}/offer-letter`)
      onRefresh()
    } finally {
      setSendingOffer(false)
    }
  }

  async function handleMarkHired() {
    setMarkingHired(true)
    try {
      await api.post(`/employer/applications/${applicationId}/mark-hired`)
      onRefresh()
    } finally {
      setMarkingHired(false)
    }
  }

  async function handleDownloadOwnOffer() {
    setDownloadingOffer(true)
    try {
      const response = await api.get(`/employer/offer-letters/${offerLetter.id}/download`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `offer-letter-${offerLetter.id}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => window.URL.revokeObjectURL(url), 1000)
    } finally {
      setDownloadingOffer(false)
    }
  }

  async function handleDownloadResume() {
    setDownloadingResume(true)
    try {
      const response = await api.get(`/employer/applications/${applicationId}/candidate-profile/resume/download`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `${application.candidateName}-resume.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => window.URL.revokeObjectURL(url), 1000)
    } finally {
      setDownloadingResume(false)
    }
  }

  if (loading) {
    return <p className="mt-4 text-sm text-slate-500">Loading details...</p>
  }

  return (
    <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Candidate profile</h3>
        {profileError && <p className="mt-1 text-sm text-slate-500">{profileError}</p>}
        {profile && (
          <div className="mt-2 space-y-2 text-sm text-slate-600">
            {profile.phone && <p>Phone: {profile.phone}</p>}
            {profile.address && <p>Address: {profile.address}</p>}
            {profile.summary && <p>{profile.summary}</p>}
            {(profile.resumeUrl || profile.hasResume) && (
              <div className="flex flex-wrap items-center gap-3">
                {profile.hasResume && (
                  <button
                    type="button"
                    onClick={handleDownloadResume}
                    disabled={downloadingResume}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60"
                  >
                    <Download size={12} /> {downloadingResume ? 'Downloading...' : 'Download resume'}
                  </button>
                )}
                {profile.resumeUrl && (
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    View resume link
                  </a>
                )}
              </div>
            )}
            {profile.workPermitStatus && <p>Work permit: {titleCase(profile.workPermitStatus)}</p>}
            {profile.experience.length > 0 && (
              <div>
                <p className="font-semibold text-slate-700">Experience</p>
                {profile.experience.map((exp) => (
                  <p key={exp.id} className="text-slate-500">
                    {exp.jobTitle} at {exp.companyName} ({formatDate(exp.startDate)} - {exp.currentlyWorking ? 'Present' : formatDate(exp.endDate)})
                  </p>
                ))}
              </div>
            )}
            {profile.education.length > 0 && (
              <div>
                <p className="font-semibold text-slate-700">Education</p>
                {profile.education.map((edu) => (
                  <p key={edu.id} className="text-slate-500">{edu.degree}, {edu.institution}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Interviews</h3>
          <button
            type="button"
            onClick={() => setShowScheduleForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
          >
            <CalendarPlus size={14} /> Schedule
          </button>
        </div>

        <div className="mt-2 space-y-2">
          {interviews.length === 0 && <p className="text-sm text-slate-500">No interviews scheduled yet.</p>}
          {interviews.map((interview) => {
            const isActive = interview.status === 'SCHEDULED' || interview.status === 'ACCEPTED'
            return (
              <div key={interview.id} className="rounded-xl border border-slate-100 px-3 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">
                    {interview.interviewType && `${titleCase(interview.interviewType)} · `}
                    {formatDateTime(interview.scheduledAt)} · {titleCase(interview.mode)}
                  </span>
                  <StatusBadge status={interview.status} styles={INTERVIEW_STATUS_STYLES} />
                </div>
                {interview.agenda && <p className="mt-1 text-xs text-slate-500">{interview.agenda}</p>}

                {interview.mode === 'ONLINE' &&
                  (interview.status === 'ACCEPTED' || interview.status === 'COMPLETED') &&
                  (interview.candidateAttended ? (
                    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <UserCheck size={12} /> Candidate joined the call
                    </p>
                  ) : (
                    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-amber-600">
                      <UserX size={12} /> Candidate has not joined yet
                    </p>
                  ))}

                {interview.panelists?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {interview.panelists.map((panelist) => (
                      <div key={panelist.id} className="flex items-center justify-between text-xs text-slate-500">
                        <span>{panelist.name} ({panelist.email})</span>
                        {isActive && interview.mode === 'ONLINE' && (
                          <button
                            type="button"
                            onClick={() => handleCopyPanelistInvite(interview.id, panelist.id)}
                            className="flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700"
                          >
                            <Copy size={11} /> {copiedPanelistId === panelist.id ? 'Copied!' : 'Copy invite'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {isActive && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {interview.mode === 'ONLINE' && interview.videoLinkAvailable && (
                      <button
                        type="button"
                        onClick={() => navigate(`/interviews/${interview.id}/room`)}
                        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                      >
                        <Video size={12} /> Join
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingInterview(interview)}
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                    >
                      <Pencil size={12} /> Reschedule
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDiscard(interview.id)}
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={12} /> Discard
                    </button>
                  </div>
                )}

                {interview.mode === 'ONLINE' && (
                  <div className="mt-2 border-t border-slate-100 pt-2">
                    <RecordingsList interviewId={interview.id} role="employer" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {showScheduleForm && (
          <ScheduleInterviewForm
            applicationId={applicationId}
            onScheduled={() => {
              setShowScheduleForm(false)
              loadDetails()
            }}
            onCancel={() => setShowScheduleForm(false)}
          />
        )}

        {editingInterview && (
          <ScheduleInterviewForm
            applicationId={applicationId}
            interview={editingInterview}
            onScheduled={() => {
              setEditingInterview(null)
              loadDetails()
            }}
            onCancel={() => setEditingInterview(null)}
          />
        )}
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900">Offer</h3>
        {application.status === 'APPROVED' && (
          <button
            type="button"
            onClick={handleMarkSelected}
            disabled={markingSelected}
            className="mt-2 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            <UserCheck size={14} /> {markingSelected ? 'Notifying...' : 'Notify Selected'}
          </button>
        )}
        {application.status === 'SELECTED' && (
          <p className="mt-2 text-sm text-slate-500">
            Waiting for the candidate to accept the terms and conditions.
          </p>
        )}
        {application.status === 'TERMS_ACCEPTED' && (
          <button
            type="button"
            onClick={handleSendOffer}
            disabled={sendingOffer}
            className="mt-2 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            <FileText size={14} /> {sendingOffer ? 'Sending...' : 'Send Offer Letter'}
          </button>
        )}
        {application.status === 'OFFER_SENT' && offerLetter && (
          <div className="mt-2 space-y-2 text-sm text-slate-500">
            <p>Offer sent on {formatDateTime(offerLetter.issuedAt)}. Awaiting the candidate's signature.</p>
            <button
              type="button"
              onClick={handleDownloadOwnOffer}
              disabled={downloadingOffer}
              className="flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-60"
            >
              <Download size={12} /> {downloadingOffer ? 'Downloading...' : 'Download your copy'}
            </button>
          </div>
        )}
        {application.status === 'OFFER_ACCEPTED' && offerLetter && (
          <div className="mt-2 space-y-2 text-sm text-slate-500">
            <p className="text-emerald-600">
              Offer accepted by {application.candidateName} on {formatDateTime(offerLetter.candidateAcceptedAt)}.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadOwnOffer}
                disabled={downloadingOffer}
                className="flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-60"
              >
                <Download size={12} /> {downloadingOffer ? 'Downloading...' : 'Download offer letter'}
              </button>
              <button
                type="button"
                onClick={handleMarkHired}
                disabled={markingHired}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 disabled:opacity-60"
              >
                <PartyPopper size={12} /> {markingHired ? 'Marking...' : 'Mark as Hired'}
              </button>
            </div>
          </div>
        )}
        {application.status === 'HIRED' && (
          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
            <PartyPopper size={14} /> Hired
          </p>
        )}
        {application.status === 'OFFER_DECLINED' && (
          <p className="mt-2 text-sm text-slate-500">This candidate declined the offer.</p>
        )}
        {application.status === 'WITHDRAWN' && (
          <p className="mt-2 text-sm text-slate-500">The candidate withdrew this application.</p>
        )}
        {![
          'APPROVED',
          'SELECTED',
          'TERMS_ACCEPTED',
          'OFFER_SENT',
          'OFFER_ACCEPTED',
          'HIRED',
          'OFFER_DECLINED',
          'WITHDRAWN',
        ].includes(application.status) && (
          <p className="mt-2 text-sm text-slate-500">
            Approve this candidate to unlock the offer workflow.
          </p>
        )}
      </div>
    </div>
  )
}

function ScheduleInterviewForm({ applicationId, interview, onScheduled, onCancel }) {
  const isEdit = Boolean(interview)
  const [scheduledAt, setScheduledAt] = useState(interview ? toLocalDateTimeInput(interview.scheduledAt) : '')
  const [endAt, setEndAt] = useState(interview ? toLocalDateTimeInput(interview.endAt) : '')
  const [interviewType, setInterviewType] = useState(interview?.interviewType || 'TECHNICAL')
  const [timezone, setTimezone] = useState(interview?.timezone || browserTimezone())
  const [mode, setMode] = useState(interview?.mode || 'ONLINE')
  const [locationOrLink, setLocationOrLink] = useState(interview?.locationOrLink || '')
  const [agenda, setAgenda] = useState(interview?.agenda || '')
  const [notes, setNotes] = useState(interview?.notes || '')
  const [panelists, setPanelists] = useState(
    interview?.panelists?.length ? interview.panelists.map((p) => ({ name: p.name, email: p.email })) : [],
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updatePanelist(index, field, value) {
    setPanelists((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)))
  }

  function addPanelist() {
    setPanelists((prev) => [...prev, { name: '', email: '' }])
  }

  function removePanelist(index) {
    setPanelists((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const payload = {
      scheduledAt: new Date(scheduledAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
      interviewType,
      timezone,
      mode,
      locationOrLink: mode === 'ONLINE' ? '' : locationOrLink,
      agenda,
      notes,
      panelists: panelists.filter((p) => p.name.trim() && p.email.trim()),
    }
    try {
      if (isEdit) {
        await api.put(`/employer/interviews/${interview.id}`, payload)
      } else {
        await api.post(`/employer/applications/${applicationId}/interviews`, payload)
      }
      onScheduled()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save interview.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4">
      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Interview type</span>
          <select value={interviewType} onChange={(e) => setInterviewType(e.target.value)} className="input">
            {INTERVIEW_TYPES.map((type) => (
              <option key={type} value={type}>{titleCase(type)}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Mode</span>
          <select value={mode} onChange={(e) => setMode(e.target.value)} className="input">
            {INTERVIEW_MODES.map((m) => (
              <option key={m} value={m}>{titleCase(m)}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Start time</span>
          <input required type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="input" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">End time</span>
          <input required type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className="input" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Time zone</span>
          <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="input">
            {[timezone, ...TIMEZONES.filter((tz) => tz !== timezone)].map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </label>
      </div>

      {mode === 'ONLINE' ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-indigo-300 bg-white px-3 py-2.5 text-sm text-indigo-700">
          <Video size={16} className="shrink-0" />
          A secure video link will be generated automatically when you save.
        </div>
      ) : (
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Location or link</span>
          <input value={locationOrLink} onChange={(e) => setLocationOrLink(e.target.value)} className="input" placeholder="Meeting link or address" />
        </label>
      )}

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Agenda</span>
        <textarea value={agenda} onChange={(e) => setAgenda(e.target.value)} className="input min-h-20" placeholder="What will be covered in this interview" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Notes</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input min-h-20" />
      </label>

      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Interviewers / panel</span>
          <button
            type="button"
            onClick={addPanelist}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-white"
          >
            <Plus size={12} /> Add panelist
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {panelists.map((panelist, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={panelist.name}
                onChange={(e) => updatePanelist(index, 'name', e.target.value)}
                placeholder="Name"
                className="input"
              />
              <input
                value={panelist.email}
                onChange={(e) => updatePanelist(index, 'email', e.target.value)}
                placeholder="Email"
                type="email"
                className="input"
              />
              <button type="button" onClick={() => removePanelist(index)} className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-white">
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Schedule Interview'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white">
          Cancel
        </button>
      </div>
    </form>
  )
}

function toLocalDateTimeInput(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
