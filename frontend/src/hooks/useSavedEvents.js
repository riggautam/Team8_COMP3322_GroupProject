import { useState } from 'react'
import requestJson from './requestJson.js'

// Saving and unsaving events (the ☆ buttons). Each event from GET /api/events says whether the
// visitor has saved it (event.saved). A click is remembered here straight away, so the star
// changes without reloading every event; the next time the list loads, the server agrees.
function useSavedEvents() {
  const [changes, setChanges] = useState({}) // event id -> true (saved) or false (unsaved)
  const [error, setError] = useState(null)

  function isSaved(event) {
    return changes[event.id] ?? event.saved
  }

  async function toggleSaved(event) {
    const save = !isSaved(event)
    const result = await requestJson(`/api/events/${event.id}/save`, { method: save ? 'PUT' : 'DELETE' })
    setError(result.error)
    if (!result.error) {
      setChanges((current) => ({ ...current, [event.id]: save }))
    }
  }

  return { isSaved, toggleSaved, error }
}

export default useSavedEvents
