import { useState } from 'react'
import { Link } from 'react-router'
import Button from '../forms/Button.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import requestJson from '../../hooks/requestJson.js'
import './ReportButton.css'

// The reasons the server accepts (routes/reports/reports.js), with friendlier labels.
export const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or advertising' },
  { value: 'offensive', label: 'Offensive or abusive' },
  { value: 'personal_info', label: 'Shares personal information' },
  { value: 'misleading', label: 'Misleading or false' },
  { value: 'other', label: 'Something else' },
]

// A small "Report" link that opens a form underneath it. onHidden runs when this report was
// the one that hid the item (the third report), so the page can take it off the screen.
function ReportButton({ targetType, targetId, onHidden }) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState(REPORT_REASONS[0].value)
  const [details, setDetails] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState(null)
  const [isDone, setIsDone] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser's own form submit (a page reload)
    setIsSending(true)
    setError(null)
    const result = await requestJson('/api/reports', {
      method: 'POST',
      body: { targetType, targetId, reason, details },
    })
    setIsSending(false)

    if (result.error) {
      setError(result.error)
      return
    }
    setIsDone(true)
    if (result.data.data.hidden && onHidden) onHidden()
  }

  // Reporting needs an account, so logged-out visitors are sent to log in.
  if (!user) {
    return (
      <Link className="report-link" to="/login">
        Report
      </Link>
    )
  }

  if (isDone) {
    return (
      <p className="report-message" role="status">
        Thanks. An admin will review it.
      </p>
    )
  }

  if (!isOpen) {
    return (
      <button type="button" className="report-link" onClick={() => setIsOpen(true)}>
        Report
      </button>
    )
  }

  return (
    <form className="report-form" onSubmit={handleSubmit}>
      <label>
        Why are you reporting this?
        <select value={reason} onChange={(event) => setReason(event.target.value)}>
          {REPORT_REASONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        More details (optional)
        <textarea
          maxLength={500}
          onChange={(event) => setDetails(event.target.value)}
          rows={2}
          value={details}
        />
      </label>
      {error && (
        <p className="status-message status-message--error" role="alert">
          {error}
        </p>
      )}
      <div className="report-actions">
        <Button type="submit" size="small" disabled={isSending}>
          {isSending ? 'Sending…' : 'Send report'}
        </Button>
        <button
          type="button"
          className="report-link"
          onClick={() => {
            setIsOpen(false)
            setError(null)
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default ReportButton
