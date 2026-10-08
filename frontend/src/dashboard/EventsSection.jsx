import { useState } from 'react'
import useApi from '../hooks/useApi.js'

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })

function EventsSection() {
  const [category, setCategory] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const query = category ? `?category=${encodeURIComponent(category)}` : ''
  const { data, error, isLoading } = useApi(`/api/events${query}`)

  const events = data?.events ?? []
  const categories = data?.categories ?? []

  function selectCategory(next) {
    setCategory(next)
    setSelectedId(null)
  }

  return (
    <section className="dash-card dash-events" aria-labelledby="events-title">
      <h2 id="events-title">Today's events</h2>

      <ul className="dash-filters" aria-label="Filter events by category">
        {['', ...categories].map((name) => (
          <li key={name || 'all'}>
            <button
              type="button"
              aria-pressed={category === name}
              onClick={() => selectCategory(name)}
            >
              {name || 'All'}
            </button>
          </li>
        ))}
      </ul>

      {isLoading && <p role="status">Loading events…</p>}
      {error && <p role="alert">Could not load events: {error}</p>}
      {!isLoading && !error && events.length === 0 && (
        <p>No events for this category today.</p>
      )}

      <ul className="dash-list">
        {events.map((event) => {
          const isOpen = selectedId === event.id
          return (
            <li key={event.id}>
              <h3>
                <button
                  type="button"
                  className="dash-link-button"
                  aria-expanded={isOpen}
                  onClick={() => setSelectedId(isOpen ? null : event.id)}
                >
                  {event.title}
                </button>
              </h3>
              <p className="dash-meta">
                {timeFormat.format(new Date(event.startsAt))} · {event.category}
              </p>
              {isOpen && (
                <>
                  <p>{event.description}</p>
                  <p className="dash-meta">Location: {event.location}</p>
                </>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default EventsSection
