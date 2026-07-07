import { useState } from 'react'
import { Download, Video } from 'lucide-react'
import api from '../lib/api.js'
import { formatDateTime } from '../lib/format.js'

// Lists and downloads a call's recordings, fetched on demand (not every
// interview has one, so we avoid an eager request per card).
export default function RecordingsList({ interviewId, role }) {
  const [recordings, setRecordings] = useState(null)
  const [loading, setLoading] = useState(false)
  const [downloadingId, setDownloadingId] = useState(null)

  async function loadRecordings() {
    setLoading(true)
    try {
      const { data } = await api.get(`/${role}/interviews/${interviewId}/recordings`)
      setRecordings(data)
    } finally {
      setLoading(false)
    }
  }

  async function download(recording) {
    setDownloadingId(recording.id)
    try {
      const response = await api.get(`/${role}/recordings/${recording.id}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = recording.originalFileName || `recording-${recording.id}.webm`
      document.body.appendChild(link)
      link.click()
      link.remove()
      // Revoking immediately races with the browser handing the blob off to
      // its download pipeline (can silently cancel/corrupt larger files).
      setTimeout(() => window.URL.revokeObjectURL(url), 1000)
    } finally {
      setDownloadingId(null)
    }
  }

  if (recordings === null) {
    return (
      <button
        type="button"
        onClick={loadRecordings}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 disabled:opacity-60"
      >
        <Video size={12} /> {loading ? 'Loading recordings...' : 'View recordings'}
      </button>
    )
  }

  if (recordings.length === 0) {
    return <p className="text-xs text-slate-500">No recordings for this interview.</p>
  }

  return (
    <div className="space-y-1.5">
      {recordings.map((recording) => (
        <div key={recording.id} className="flex items-center justify-between text-xs text-slate-600">
          <span>
            {formatDateTime(recording.uploadedAt)} · {(recording.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB
          </span>
          <button
            type="button"
            onClick={() => download(recording)}
            disabled={downloadingId === recording.id}
            className="flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-60"
          >
            <Download size={11} /> {downloadingId === recording.id ? 'Downloading...' : 'Download'}
          </button>
        </div>
      ))}
    </div>
  )
}
