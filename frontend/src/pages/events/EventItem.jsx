import { useState } from 'react'
import { formatTime } from '../../components/events/eventDates.js'
import SaveEventButton from '../../components/events/SaveEventButton.jsx'
import ReportButton from '../../components/moderation/ReportButton.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import requestJson from '../../hooks/requestJson.js'

// One event in the list. Clicking the title opens its details and buttons.
// onRemoved(message) runs after the event was deleted, or hidden by this person's report.
// isSaved and onToggleSave come from useSavedEvents, for the ☆ button.
function EventItem({ event, onEdit, onRemoved, isSaved, onToggleSave }) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState(null)

  // The sample events have no creator (createdById is null), so nobody owns them.
  const isOwner = user != null && user.id === event.createdById
  // The server checks the role again on every request; this only decides which buttons to show.
  const isAdmin = user?.role === 'admin'

  async function handleDelete() {
    if (!window.confirm(`Delete "${event.title}"? This can't be undone.`)) return
    setIsDeleting(true)
    setError(null)
    const result = await requestJson(`/api/events/${event.id}`, { method: 'DELETE' })
    setIsDeleting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    onRemoved(`Deleted "${event.title}".`)
  }

  return (
    <li className="events-item" data-event-category={event.category}>
      <time className="events-time" dateTime={event.startsAt}>
        {formatTime(event.startsAt)}
      </time>
      <div className="events-body">
        <h3>
          <button
            type="button"
            className="events-title"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
          >
            {event.title}
          </button>
        </h3>
        <p className="events-meta">
          {event.category} · {event.location}
        </p>

        {isOpen && (
          <div className="events-details">
            {event.description && <p className="events-description">{event.description}</p>}
            <p className="events-meta">Added by {event.createdBy}</p>
            <div className="events-actions">
              {(isOwner || isAdmin) && (
                <>
                  <button type="button" className="events-text-button" onClick={() => onEdit(event)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="events-text-button events-text-button--danger"
                    disabled={isDeleting}
                    onClick={handleDelete}
                  >
                    {isOwner ? 'Delete' : 'Delete (admin)'}
                  </button>
                </>
              )}
              {!isOwner && (
                <ReportButton
                  targetType="event"
                  targetId={event.id}
                  onHidden={() => onRemoved('Thanks. That event is now hidden until an admin reviews it.')}
                />
              )}
            </div>
            {error && (
              <p className="status-message status-message--error events-form-error" role="alert">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
      <SaveEventButton event={event} isSaved={isSaved} onToggle={onToggleSave} />
    </li>
  )
}

export default EventItem
