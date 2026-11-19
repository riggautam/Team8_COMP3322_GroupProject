import { useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../../contexts/AuthContext.jsx'
import './SaveEventButton.css'

// The ☆ / ★ button that saves an event to the dashboard. onToggle does the request
// (see hooks/useSavedEvents.js). Saving needs an account, so logged-out visitors go to log in.
function SaveEventButton({ event, isSaved, onToggle }) {
  const { user } = useAuth()
  const [isSending, setIsSending] = useState(false)

  if (!user) {
    return (
      <Link className="save-event" to="/login" aria-label={`Log in to save ${event.title}`} title="Log in to save">
        ☆
      </Link>
    )
  }

  async function handleClick() {
    setIsSending(true)
    await onToggle(event)
    setIsSending(false)
  }

  return (
    <button
      type="button"
      className="save-event"
      aria-label={isSaved ? `Unsave ${event.title}` : `Save ${event.title}`}
      aria-pressed={isSaved}
      disabled={isSending}
      onClick={handleClick}
      title={isSaved ? 'Saved. Click to unsave.' : 'Save to your dashboard'}
    >
      {isSaved ? '★' : '☆'}
    </button>
  )
}

export default SaveEventButton
