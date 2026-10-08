import { useState } from 'react'
import useApi from '../hooks/useApi.js'
import './Dashboard.css'

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })

function Dashboard() {
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
    <section className="dashboard" aria-labelledby="dashboard-title">
      <h1 id="dashboard-title">Today on campus</h1>

      <ul className="dashboard-filters" aria-label="Filter events by category">
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

      <ul className="dashboard-events">
        {events.map((event) => {
          const isOpen = selectedId === event.id
          return (
            <li key={event.id}>
              <article>
                <h2>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setSelectedId(isOpen ? null : event.id)}
                  >
                    {event.title}
                  </button>
                </h2>
                <p className="dashboard-meta">
                  {timeFormat.format(new Date(event.startsAt))} · {event.category}
                </p>
                {isOpen && (
                  <>
                    <p>{event.description}</p>
                    <p className="dashboard-meta">Location: {event.location}</p>
                  </>
                )}
              </article>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default Dashboard
