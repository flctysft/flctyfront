import { useEffect, useState } from 'react'
import { GraduationCap, Briefcase, Pencil, Trash2, Plus, X, FileText, Download, Upload } from 'lucide-react'
import api from '../../lib/api.js'
import { formatDate, titleCase } from '../../lib/format.js'

const WORK_PERMIT_OPTIONS = ['CITIZEN', 'PERMIT_HOLDER', 'VISA_SPONSORSHIP_REQUIRED', 'NOT_APPLICABLE']

const emptyProfileForm = {
  phone: '',
  address: '',
  dateOfBirth: '',
  summary: '',
  resumeUrl: '',
  workPermitStatus: 'NOT_APPLICABLE',
  workPermitDocumentUrl: '',
  skills: '',
  consentGiven: false,
}

const emptyEducationForm = {
  institution: '',
  degree: '',
  fieldOfStudy: '',
  startDate: '',
  endDate: '',
  grade: '',
}

const emptyExperienceForm = {
  companyName: '',
  jobTitle: '',
  startDate: '',
  endDate: '',
  currentlyWorking: false,
  description: '',
}

export default function MyProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyProfileForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [educationForm, setEducationForm] = useState(null)
  const [experienceForm, setExperienceForm] = useState(null)

  const [resumeFile, setResumeFile] = useState(null)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [downloadingResume, setDownloadingResume] = useState(false)
  const [resumeError, setResumeError] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    setLoading(true)
    try {
      const { data } = await api.get('/candidate/profile')
      setProfile(data)
      setForm({
        phone: data.phone || '',
        address: data.address || '',
        dateOfBirth: data.dateOfBirth || '',
        summary: data.summary || '',
        resumeUrl: data.resumeUrl || '',
        workPermitStatus: data.workPermitStatus || 'NOT_APPLICABLE',
        workPermitDocumentUrl: data.workPermitDocumentUrl || '',
        skills: (data.skills || []).join(', '),
        consentGiven: data.consentGiven,
      })
    } catch (err) {
      if (err.response?.status === 404) {
        setProfile(null)
      } else {
        setError('Could not load your profile.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const { data } = await api.put('/candidate/profile', {
        ...form,
        dateOfBirth: form.dateOfBirth || null,
        skills: form.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      })
      setProfile(data)
      setSuccess('Profile saved.')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your profile.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveEducation(e) {
    e.preventDefault()
    setError('')
    try {
      const payload = { ...educationForm, endDate: educationForm.endDate || null }
      if (educationForm.id) {
        await api.put(`/candidate/profile/education/${educationForm.id}`, payload)
      } else {
        await api.post('/candidate/profile/education', payload)
      }
      setEducationForm(null)
      await loadProfile()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save education entry.')
    }
  }

  async function handleDeleteEducation(id) {
    if (!confirm('Delete this education entry?')) return
    try {
      await api.delete(`/candidate/profile/education/${id}`)
      await loadProfile()
    } catch {
      setError('Could not delete education entry.')
    }
  }

  async function handleSaveExperience(e) {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        ...experienceForm,
        endDate: experienceForm.currentlyWorking ? null : experienceForm.endDate || null,
      }
      if (experienceForm.id) {
        await api.put(`/candidate/profile/experience/${experienceForm.id}`, payload)
      } else {
        await api.post('/candidate/profile/experience', payload)
      }
      setExperienceForm(null)
      await loadProfile()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save experience entry.')
    }
  }

  async function handleDeleteExperience(id) {
    if (!confirm('Delete this experience entry?')) return
    try {
      await api.delete(`/candidate/profile/experience/${id}`)
      await loadProfile()
    } catch {
      setError('Could not delete experience entry.')
    }
  }

  async function handleResumeUpload(e) {
    e.preventDefault()
    if (!resumeFile) return
    setResumeError('')
    setUploadingResume(true)
    try {
      const formData = new FormData()
      formData.append('file', resumeFile)
      await api.post('/candidate/profile/resume', formData)
      setResumeFile(null)
      await loadProfile()
    } catch (err) {
      setResumeError(err.response?.data?.message || 'Could not upload resume.')
    } finally {
      setUploadingResume(false)
    }
  }

  async function handleResumeDownload() {
    setDownloadingResume(true)
    try {
      const response = await api.get('/candidate/profile/resume/download', { responseType: 'blob' })
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = 'resume.pdf'
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => window.URL.revokeObjectURL(url), 1000)
    } finally {
      setDownloadingResume(false)
    }
  }

  async function handleResumeDelete() {
    if (!confirm('Delete your uploaded resume?')) return
    try {
      await api.delete('/candidate/profile/resume')
      await loadProfile()
    } catch {
      setResumeError('Could not delete resume.')
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-4xl px-6 py-16 text-center text-slate-500">Loading profile...</div>
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
      <p className="mt-1 text-sm text-slate-500">
        {profile ? 'Keep your profile up to date to improve your applications.' : 'Complete your profile before applying to jobs.'}
      </p>

      {error && <div className="mt-6 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}
      {success && <div className="mt-6 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{success}</div>}

      <form onSubmit={handleSaveProfile} className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input"
              placeholder="+1 555 123 4567"
            />
          </Field>
          <Field label="Date of birth">
            <input
              type="date"
              value={form.dateOfBirth || ''}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              className="input"
            />
          </Field>
        </div>

        <Field label="Address">
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="input"
            placeholder="City, Country"
          />
        </Field>

        <Field label="Summary">
          <textarea
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            className="input min-h-24"
            placeholder="A short summary about yourself"
          />
        </Field>

        <Field label="Resume URL">
          <input
            type="url"
            value={form.resumeUrl}
            onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })}
            className="input"
            placeholder="https://..."
          />
        </Field>

        <Field label="Skills (comma separated)">
          <input
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
            className="input"
            placeholder="React, Node.js, SQL"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Work permit status">
            <select
              value={form.workPermitStatus}
              onChange={(e) => setForm({ ...form, workPermitStatus: e.target.value })}
              className="input"
            >
              {WORK_PERMIT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {titleCase(option)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Work permit document URL">
            <input
              type="url"
              value={form.workPermitDocumentUrl}
              onChange={(e) => setForm({ ...form, workPermitDocumentUrl: e.target.value })}
              className="input"
              placeholder="https://..."
            />
          </Field>
        </div>

        <label className="flex items-start gap-2.5 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.consentGiven}
            onChange={(e) => setForm({ ...form, consentGiven: e.target.checked })}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          I consent to HireHub storing and processing my information for recruitment purposes.
        </label>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      {profile && (
        <>
          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <FileText size={18} />
              </span>
              <h2 className="text-lg font-bold text-slate-900">Resume</h2>
            </div>

            {resumeError && (
              <div className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{resumeError}</div>
            )}

            {profile.hasResume ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100">
                    <FileText size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Resume on file</p>
                    <p className="text-xs text-slate-500">Ready to share with employers</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResumeDownload}
                    disabled={downloadingResume}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60"
                  >
                    <Download size={14} /> {downloadingResume ? 'Downloading...' : 'Download'}
                  </button>
                  <button
                    type="button"
                    onClick={handleResumeDelete}
                    className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                No resume uploaded yet &mdash; add one so employers can review it instantly.
              </p>
            )}

            <form onSubmit={handleResumeUpload} className="mt-4 flex flex-wrap items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600">
                <Upload size={14} />
                <span className="max-w-48 truncate">{resumeFile ? resumeFile.name : 'Choose PDF'}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setResumeFile(e.target.files[0] || null)}
                  className="hidden"
                />
              </label>
              <button
                type="submit"
                disabled={!resumeFile || uploadingResume}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {uploadingResume ? 'Uploading...' : profile.hasResume ? 'Replace' : 'Upload'}
              </button>
            </form>
          </div>

          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <GraduationCap size={20} className="text-indigo-600" />
                Education
              </h2>
              <button
                type="button"
                onClick={() => setEducationForm(emptyEducationForm)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
              >
                <Plus size={16} /> Add
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {profile.education.length === 0 && (
                <p className="text-sm text-slate-500">No education entries yet.</p>
              )}
              {profile.education.map((entry) => (
                <div key={entry.id} className="flex items-start justify-between rounded-2xl border border-slate-200 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{entry.degree} · {entry.institution}</p>
                    <p className="text-sm text-slate-500">
                      {entry.fieldOfStudy ? `${entry.fieldOfStudy} · ` : ''}
                      {formatDate(entry.startDate)} - {entry.endDate ? formatDate(entry.endDate) : 'Present'}
                      {entry.grade ? ` · ${entry.grade}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <IconButton onClick={() => setEducationForm(entry)}><Pencil size={15} /></IconButton>
                    <IconButton onClick={() => handleDeleteEducation(entry.id)}><Trash2 size={15} /></IconButton>
                  </div>
                </div>
              ))}
            </div>

            {educationForm && (
              <EntryFormCard title={educationForm.id ? 'Edit education' : 'Add education'} onClose={() => setEducationForm(null)}>
                <form onSubmit={handleSaveEducation} className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Institution">
                      <input required value={educationForm.institution} onChange={(e) => setEducationForm({ ...educationForm, institution: e.target.value })} className="input" />
                    </Field>
                    <Field label="Degree">
                      <input required value={educationForm.degree} onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })} className="input" />
                    </Field>
                  </div>
                  <Field label="Field of study">
                    <input value={educationForm.fieldOfStudy} onChange={(e) => setEducationForm({ ...educationForm, fieldOfStudy: e.target.value })} className="input" />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Start date">
                      <input required type="date" value={educationForm.startDate} onChange={(e) => setEducationForm({ ...educationForm, startDate: e.target.value })} className="input" />
                    </Field>
                    <Field label="End date">
                      <input type="date" value={educationForm.endDate || ''} onChange={(e) => setEducationForm({ ...educationForm, endDate: e.target.value })} className="input" />
                    </Field>
                  </div>
                  <Field label="Grade">
                    <input value={educationForm.grade || ''} onChange={(e) => setEducationForm({ ...educationForm, grade: e.target.value })} className="input" />
                  </Field>
                  <SaveCancelButtons onCancel={() => setEducationForm(null)} />
                </form>
              </EntryFormCard>
            )}
          </div>

          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Briefcase size={20} className="text-indigo-600" />
                Experience
              </h2>
              <button
                type="button"
                onClick={() => setExperienceForm(emptyExperienceForm)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
              >
                <Plus size={16} /> Add
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {profile.experience.length === 0 && (
                <p className="text-sm text-slate-500">No experience entries yet.</p>
              )}
              {profile.experience.map((entry) => (
                <div key={entry.id} className="flex items-start justify-between rounded-2xl border border-slate-200 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{entry.jobTitle} · {entry.companyName}</p>
                    <p className="text-sm text-slate-500">
                      {formatDate(entry.startDate)} - {entry.currentlyWorking ? 'Present' : formatDate(entry.endDate)}
                    </p>
                    {entry.description && <p className="mt-1 text-sm text-slate-600">{entry.description}</p>}
                  </div>
                  <div className="flex gap-1">
                    <IconButton onClick={() => setExperienceForm(entry)}><Pencil size={15} /></IconButton>
                    <IconButton onClick={() => handleDeleteExperience(entry.id)}><Trash2 size={15} /></IconButton>
                  </div>
                </div>
              ))}
            </div>

            {experienceForm && (
              <EntryFormCard title={experienceForm.id ? 'Edit experience' : 'Add experience'} onClose={() => setExperienceForm(null)}>
                <form onSubmit={handleSaveExperience} className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Company name">
                      <input required value={experienceForm.companyName} onChange={(e) => setExperienceForm({ ...experienceForm, companyName: e.target.value })} className="input" />
                    </Field>
                    <Field label="Job title">
                      <input required value={experienceForm.jobTitle} onChange={(e) => setExperienceForm({ ...experienceForm, jobTitle: e.target.value })} className="input" />
                    </Field>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Start date">
                      <input required type="date" value={experienceForm.startDate} onChange={(e) => setExperienceForm({ ...experienceForm, startDate: e.target.value })} className="input" />
                    </Field>
                    <Field label="End date">
                      <input
                        type="date"
                        disabled={experienceForm.currentlyWorking}
                        value={experienceForm.endDate || ''}
                        onChange={(e) => setExperienceForm({ ...experienceForm, endDate: e.target.value })}
                        className="input disabled:opacity-50"
                      />
                    </Field>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={experienceForm.currentlyWorking}
                      onChange={(e) => setExperienceForm({ ...experienceForm, currentlyWorking: e.target.checked, endDate: e.target.checked ? '' : experienceForm.endDate })}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    I currently work here
                  </label>
                  <Field label="Description">
                    <textarea value={experienceForm.description || ''} onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })} className="input min-h-20" />
                  </Field>
                  <SaveCancelButtons onCancel={() => setExperienceForm(null)} />
                </form>
              </EntryFormCard>
            )}
          </div>
        </>
      )}
    </section>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  )
}

function IconButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
    >
      {children}
    </button>
  )
}

function EntryFormCard({ title, onClose, children }) {
  return (
    <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-white">
          <X size={16} />
        </button>
      </div>
      {children}
    </div>
  )
}

function SaveCancelButtons({ onCancel }) {
  return (
    <div className="flex gap-2 pt-1">
      <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">
        Save
      </button>
      <button type="button" onClick={onCancel} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white">
        Cancel
      </button>
    </div>
  )
}
