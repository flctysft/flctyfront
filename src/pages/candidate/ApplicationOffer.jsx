import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2, Clock, Download, FileText, XCircle, PartyPopper } from 'lucide-react'
import api from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatDateTime } from '../../lib/format.js'
import TermsAndConditions from '../../components/TermsAndConditions.jsx'
import OfferAcceptanceTerms from '../../components/OfferAcceptanceTerms.jsx'
import BackLink from '../../components/BackLink.jsx'

export default function ApplicationOffer() {
  const { id } = useParams()
  const { user } = useAuth()
  const [application, setApplication] = useState(null)
  const [offerLetter, setOfferLetter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [signatureName, setSignatureName] = useState(user?.fullName || '')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [declining, setDeclining] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)

  useEffect(() => {
    loadApplication()
  }, [id])

  async function loadApplication() {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get(`/candidate/applications/${id}`)
      setApplication(data)
      if (data.status === 'OFFER_SENT' || data.status === 'OFFER_ACCEPTED') {
        const offerResult = await api.get(`/candidate/applications/${id}/offer-letter`)
        setOfferLetter(offerResult.data)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load this application.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAcceptTerms(e) {
    e.preventDefault()
    setSubmitError('')
    setSubmitting(true)
    try {
      await api.post(`/candidate/applications/${id}/accept-terms`, { signatureName })
      await loadApplication()
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Could not accept the terms.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAcceptOffer(e) {
    e.preventDefault()
    setSubmitError('')
    setSubmitting(true)
    try {
      await api.post(`/candidate/offer-letters/${offerLetter.id}/accept`, { signatureName })
      await loadApplication()
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Could not accept the offer.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeclineOffer() {
    if (!confirm('Are you sure you want to decline this offer? This cannot be undone.')) return
    setSubmitError('')
    setDeclining(true)
    try {
      await api.post(`/candidate/offer-letters/${offerLetter.id}/decline`)
      await loadApplication()
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Could not decline the offer.')
    } finally {
      setDeclining(false)
    }
  }

  async function handleWithdraw() {
    if (!confirm('Withdraw this application? This cannot be undone.')) return
    setSubmitError('')
    setWithdrawing(true)
    try {
      await api.post(`/candidate/applications/${id}/withdraw`)
      await loadApplication()
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Could not withdraw this application.')
    } finally {
      setWithdrawing(false)
    }
  }

  async function handleDownload() {
    setDownloading(true)
    try {
      const response = await api.get(`/candidate/offer-letters/${offerLetter.id}/download`, {
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
      setDownloading(false)
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-2xl px-6 py-16 text-center text-slate-500">Loading...</div>
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-sm font-medium text-slate-700">{error}</p>
        <div className="mt-4 flex justify-center">
          <BackLink to="/candidate/applications" label="Back to my applications" />
        </div>
      </div>
    )
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      <BackLink to="/candidate/applications" label="Back to my applications" />
      <h1 className="mt-4 text-2xl font-bold text-slate-900">{application.jobTitle}</h1>

      {submitError && <div className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{submitError}</div>}

      {application.status === 'SELECTED' && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 size={18} />
            <p className="font-semibold">You&apos;ve been selected!</p>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Please review and accept the terms and conditions below to proceed.
          </p>
          <div className="mt-4">
            <TermsAndConditions />
          </div>
          <form onSubmit={handleAcceptTerms} className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Type your full name to sign
              </span>
              <input
                required
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                className="input"
                placeholder="Your full name"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'I Agree & Accept'}
            </button>
          </form>
        </div>
      )}

      {application.status === 'TERMS_ACCEPTED' && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Clock size={28} className="mx-auto text-amber-400" />
          <p className="mt-3 text-sm font-medium text-slate-700">
            You&apos;ve accepted the terms and conditions. Waiting for the employer to send your offer letter.
          </p>
        </div>
      )}

      {application.status === 'OFFER_SENT' && offerLetter && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-700">
            <FileText size={18} />
            <p className="font-semibold">Your offer letter is ready</p>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Review and sign the acceptance below to unlock your offer letter download.
          </p>
          <div className="mt-4">
            <OfferAcceptanceTerms />
          </div>
          <form onSubmit={handleAcceptOffer} className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Type your full name to sign
              </span>
              <input
                required
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                className="input"
                placeholder="Your full name"
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting || declining}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Accept & Sign'}
              </button>
              <button
                type="button"
                onClick={handleDeclineOffer}
                disabled={submitting || declining}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                <XCircle size={15} /> {declining ? 'Declining...' : 'Decline Offer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {application.status === 'OFFER_ACCEPTED' && offerLetter && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <CheckCircle2 size={28} className="mx-auto text-emerald-500" />
          <p className="mt-3 text-sm font-medium text-slate-700">
            You accepted this offer on {formatDateTime(offerLetter.candidateAcceptedAt)}.
          </p>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            <Download size={15} />
            {downloading ? 'Downloading...' : 'Download offer letter'}
          </button>
        </div>
      )}

      {application.status === 'HIRED' && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 text-center shadow-sm">
          <PartyPopper size={28} className="mx-auto text-emerald-600" />
          <p className="mt-3 text-sm font-semibold text-emerald-700">
            Congratulations &mdash; you've been hired for this role!
          </p>
        </div>
      )}

      {application.status === 'OFFER_DECLINED' && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <XCircle size={28} className="mx-auto text-red-400" />
          <p className="mt-3 text-sm font-medium text-slate-700">You declined this offer.</p>
        </div>
      )}

      {application.status === 'WITHDRAWN' && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <XCircle size={28} className="mx-auto text-slate-400" />
          <p className="mt-3 text-sm font-medium text-slate-700">You withdrew this application.</p>
        </div>
      )}

      {['SELECTED', 'TERMS_ACCEPTED'].includes(application.status) && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleWithdraw}
            disabled={withdrawing}
            className="text-sm font-semibold text-slate-500 hover:text-red-600 disabled:opacity-60"
          >
            {withdrawing ? 'Withdrawing...' : 'Withdraw application'}
          </button>
        </div>
      )}

      {![
        'SELECTED',
        'TERMS_ACCEPTED',
        'OFFER_SENT',
        'OFFER_ACCEPTED',
        'HIRED',
        'OFFER_DECLINED',
        'WITHDRAWN',
      ].includes(application.status) && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
          There&apos;s nothing to review here yet for this application.
        </div>
      )}
    </section>
  )
}
