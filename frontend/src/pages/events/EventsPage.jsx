import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import Button from '../../components/forms/Button.jsx'
import PageBanner from '../../components/layout/PageBanner.jsx'
import CategoryFilter from '../../components/events/CategoryFilter.jsx'
import { dayLabel, groupByDay } from '../../components/events/eventDates.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import requestJson from '../../hooks/requestJson.js'
import useSavedEvents from '../../hooks/useSavedEvents.js'
import EventForm from './EventForm.jsx'
import EventItem from './EventItem.jsx'
import './Events.css'

// Today's and upcoming events, grouped by day. Anyone can look; adding, editing and
// reporting need an account.
function EventsPage() {
  const { user } = useAuth()
  // The dashboard's "Add an event" link opens this page as /events?add=1.
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState(null) // { categories, today, events } from the server
  const [loadError, setLoadError] = useState(null)
  const [category, setCategory] = useState('') // '' means All
  // null: no form. 'new': adding an event. An event object: editing that event.
  const [formEvent, setFormEvent] = useState(user && searchParams.has('add') ? 'new' : null)
  const [notice, setNotice] = useState(null) // e.g. "Deleted ..."
  const noticeRef = useRef(null)
  const savedEvents = useSavedEvents()

  async function loadEvents() {
    const result = await requestJson('/api/events')
    setLoadError(result.error)
    // On an error, keep the events already on screen instead of blanking the list.
    if (!result.error) setData(result.data)
  }

  useEffect(() => {
    loadEvents()
  }, [])

  // A deleted or hidden event disappears from the list, so show the message about it even
  // when the reader was further down the page.
  useEffect(() => {
    if (notice) noticeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [notice])

  function openForm(eventOrNew) {
    setNotice(null)
    setFormEvent(eventOrNew)
  }

  function closeForm() {
    setFormEvent(null)
    if (searchParams.has('add')) setSearchParams({}, { replace: true })
  }

  function handleSaved(savedEvent) {
    setNotice(formEvent === 'new' ? `Added "${savedEvent.title}".` : `Saved "${savedEvent.title}".`)
    closeForm()
    loadEvents()
  }

  function handleRemoved(message) {
    setNotice(message)
    if (formEvent !== null && formEvent !== 'new') closeForm() // it may have been the one being edited
    loadEvents()
  }

  const events = data?.events ?? []
  const shownEvents = category ? events.filter((event) => event.category === category) : events
  const groups = groupByDay(shownEvents)

  return (
    <div className="events-page">
      <PageBanner
        title="Events"
        description="What's on for exchange students, today and in the weeks ahead. Times are Hong Kong time."
      />

      {formEvent && data && (
        <EventForm
          // A new key gives a fresh form when switching from one event to another.
          key={formEvent === 'new' ? 'new' : formEvent.id}
          eventToEdit={formEvent === 'new' ? null : formEvent}
          categories={data.categories}
          onSaved={handleSaved}
          onCancel={closeForm}
        />
      )}

      <section className="events-card" aria-label="Upcoming events">
        <div className="events-toolbar">
          <CategoryFilter categories={data?.categories ?? []} value={category} onChange={setCategory} />
          {user ? (
            formEvent !== 'new' && <Button onClick={() => openForm('new')}>+ Add event</Button>
          ) : (
            <Link className="events-login-link" to="/login">
              Log in to add an event
            </Link>
          )}
        </div>

        {notice && (
          <p className="events-notice" ref={noticeRef} role="status">
            {notice}
          </p>
        )}
        {savedEvents.error && (
          <p className="status-message status-message--error events-form-error" role="alert">
            Could not save that event: {savedEvents.error}
          </p>
        )}
        {loadError && (
          <p className="status-message status-message--error events-form-error" role="alert">
            Could not load events: {loadError}
          </p>
        )}
        {!data && !loadError && <p role="status">Loading events…</p>}
        {data && groups.length === 0 && (
          <p className="events-empty">
            {category ? `No upcoming ${category} events.` : 'No upcoming events yet.'}
            {user && ' Why not add one?'}
          </p>
        )}

        {groups.map((group) => (
          <section key={group.day} className="events-day" aria-labelledby={`day-${group.day}`}>
            <h2 id={`day-${group.day}`}>{dayLabel(group.day, data.today)}</h2>
            <ul className="events-list">
              {group.events.map((event) => (
                <EventItem
                  key={event.id}
                  event={event}
                  onEdit={openForm}
                  onRemoved={handleRemoved}
                  isSaved={savedEvents.isSaved(event)}
                  onToggleSave={savedEvents.toggleSaved}
                />
              ))}
            </ul>
          </section>
        ))}
      </section>
    </div>
  )
}

export default EventsPage
