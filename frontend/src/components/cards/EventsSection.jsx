import { useId, useState } from 'react'
import { Link } from 'react-router'
import CategoryFilter from '../events/CategoryFilter.jsx'
import { dayLabel, eventDay, formatTime } from '../events/eventDates.js'
import SaveEventButton from '../events/SaveEventButton.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import useSavedEvents from '../../hooks/useSavedEvents.js'

const UPCOMING_COUNT = 5 // the full list is on the events page

// One list of events. Click a title to show its description and location.
// showDay adds the day ("Tomorrow", "Sat, 21 Nov") above the time, for the upcoming list.
// savedEvents (from useSavedEvents) drives the ☆ button on each event.
function EventList({ events, today, showDay, selectedId, onSelect, savedEvents }) {
  return (
    <ul className="dash-list">
      {events.map((event) => {
        const isOpen = selectedId === event.id
        return (
          <li key={event.id} className="dash-event" data-event-category={event.category}>
            <time className="dash-event-time" dateTime={event.startsAt}>
              {showDay && <span className="dash-event-day">{dayLabel(eventDay(event), today)}</span>}
              {formatTime(event.startsAt)}
            </time>
            <div className="dash-event-body">
              <h4>
                <button
                  type="button"
                  className="dash-link-button"
                  aria-expanded={isOpen}
                  onClick={() => onSelect(isOpen ? null : event.id)}
                >
                  {event.title}
                </button>
              </h4>
              <p className="dash-meta">{event.category}</p>
              {isOpen && (
                <>
                  {event.description && <p>{event.description}</p>}
                  <p className="dash-meta">Location: {event.location}</p>
                </>
              )}
            </div>
            <SaveEventButton event={event} isSaved={savedEvents.isSaved(event)} onToggle={savedEvents.toggleSaved} />
          </li>
        )
      })}
    </ul>
  )
}

// The dashboard's events card: today's events, the next few after today, and the ones the
// student saved. events is every upcoming event from GET /api/events (already filtered by category).
function EventsSection({ events, categories, today, category, onCategoryChange, isLoading, error }) {
  const titleId = useId()
  const [selectedId, setSelectedId] = useState(null)
  const savedEvents = useSavedEvents()

  const todayEvents = events.filter((event) => eventDay(event) === today)
  // "YYYY-MM-DD" text sorts like the dates themselves, so > means "after today".
  const upcomingEvents = events.filter((event) => eventDay(event) > today).slice(0, UPCOMING_COUNT)
  // Every saved event from today on. Past ones aren't in the list any more, so they drop off.
  const myEvents = events.filter((event) => savedEvents.isSaved(event))
  const inCategory = category ? ` in ${category}` : ''
  const listProps = { today, selectedId, onSelect: setSelectedId, savedEvents }

  return (
    <section className="dash-card dash-events" aria-labelledby={titleId}>
      <SectionHeading id={titleId} icon="calendar">Events</SectionHeading>

      <CategoryFilter
        categories={categories}
        value={category}
        disabled={isLoading}
        onChange={(name) => {
          setSelectedId(null)
          onCategoryChange(name)
        }}
      />

      {isLoading && <p role="status">Loading events…</p>}
      {error && <p role="alert">Could not load events: {error}</p>}
      {savedEvents.error && <p role="alert">Could not save that event: {savedEvents.error}</p>}
      {!isLoading && !error && (
        <>
          <h3 className="dash-events-heading">Today</h3>
          {todayEvents.length === 0 ? (
            <p className="dash-meta">No events today{inCategory}.</p>
          ) : (
            <EventList events={todayEvents} {...listProps} />
          )}

          <h3 className="dash-events-heading">Coming up</h3>
          {upcomingEvents.length === 0 ? (
            <p className="dash-meta">Nothing coming up{inCategory} yet.</p>
          ) : (
            <EventList events={upcomingEvents} showDay {...listProps} />
          )}

          <h3 className="dash-events-heading">Saved</h3>
          {myEvents.length === 0 ? (
            <p className="dash-meta">
              {category ? `No saved ${category} events.` : 'Tap ☆ next to an event to save it here.'}
            </p>
          ) : (
            <EventList events={myEvents} showDay {...listProps} />
          )}
        </>
      )}

      <p className="dash-events-links">
        <Link to="/events">See all events →</Link>
        <Link to="/events?add=1">+ Add an event</Link>
      </p>
    </section>
  )
}

export default EventsSection
