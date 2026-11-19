import { useId, useState } from 'react'
import Button from '../../components/forms/Button.jsx'
import { hongKongInAYear, hongKongNow } from '../../components/events/eventDates.js'
import requestJson from '../../hooks/requestJson.js'

// One form for both jobs: with eventToEdit it edits that event, without one it adds a new one.
// The server checks every field again; the limits here just catch mistakes before sending.
function EventForm({ eventToEdit, categories, onSaved, onCancel }) {
  const [title, setTitle] = useState(eventToEdit?.title ?? '')
  const [category, setCategory] = useState(eventToEdit?.category ?? categories[0])
  // The input wants "YYYY-MM-DDTHH:mm"; the server sends "YYYY-MM-DDTHH:mm:ss+08:00".
  const [startsAt, setStartsAt] = useState(eventToEdit?.startsAt.slice(0, 16) ?? '')
  const [location, setLocation] = useState(eventToEdit?.location ?? '')
  const [description, setDescription] = useState(eventToEdit?.description ?? '')
  const [error, setError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const id = useId() // a unique prefix for the input ids, so each label points at its input

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault() // stop the browser's own form submit (a page reload)
    setIsSaving(true)
    setError(null)

    const result = await requestJson(eventToEdit ? `/api/events/${eventToEdit.id}` : '/api/events', {
      method: eventToEdit ? 'PUT' : 'POST',
      body: { title, category, startsAt, location, description },
    })

    setIsSaving(false)
    if (result.error) {
      setError(result.error)
      return
    }
    onSaved(result.data)
  }

  return (
    <section className="events-card" aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`}>{eventToEdit ? 'Edit event' : 'Add an event'}</h2>
      <form className="events-form" onSubmit={handleSubmit}>
        <div className="events-field events-field--wide">
          <label htmlFor={`${id}-title`}>Title</label>
          {/* autoFocus also scrolls the form into view when Edit is clicked further down. */}
          <input
            autoFocus
            id={`${id}-title`}
            maxLength={255}
            onChange={(e) => setTitle(e.target.value)}
            required
            value={title}
          />
        </div>

        <div className="events-field">
          <label htmlFor={`${id}-category`}>Category</label>
          <select id={`${id}-category`} onChange={(e) => setCategory(e.target.value)} value={category}>
            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="events-field">
          <label htmlFor={`${id}-starts`}>Starts (Hong Kong time)</label>
          {/* A new event must start in the next year. An edit may keep a time that has passed,
              so min is only set when adding. */}
          <input
            id={`${id}-starts`}
            max={hongKongInAYear()}
            min={eventToEdit ? undefined : hongKongNow()}
            onChange={(e) => setStartsAt(e.target.value)}
            required
            type="datetime-local"
            value={startsAt}
          />
        </div>

        <div className="events-field events-field--wide">
          <label htmlFor={`${id}-location`}>Location</label>
          <input
            id={`${id}-location`}
            maxLength={255}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Main Building or Kennedy Town MTR Exit C"
            required
            value={location}
          />
        </div>

        <div className="events-field events-field--wide">
          <label htmlFor={`${id}-description`}>Description (optional)</label>
          <textarea
            id={`${id}-description`}
            maxLength={2000}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            value={description}
          />
        </div>

        {error && (
          <p className="status-message status-message--error events-form-error" role="alert">
            {error}
          </p>
        )}

        <div className="events-form-actions">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving…' : eventToEdit ? 'Save changes' : 'Add event'}
          </Button>
          <button type="button" className="events-text-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  )
}

export default EventForm
