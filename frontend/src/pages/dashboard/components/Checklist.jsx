import { useEffect, useState } from 'react'
import Button from '../../../components/forms/Button.jsx'
import SectionHeading from '../../../components/ui/SectionHeading.jsx'
import requestJson from '../../../hooks/requestJson.js'

function Checklist() {
  const [items, setItems] = useState([])
  const [newLabel, setNewLabel] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadItems() {
      const result = await requestJson('/api/checklist')
      setError(result.error)
      setItems(result.data?.data ?? [])
      setIsLoading(false)
    }
    loadItems()
  }, [])

  async function handleAdd(event) {
    event.preventDefault()
    const result = await requestJson('/api/checklist', {
      method: 'POST',
      body: { label: newLabel },
    })
    setError(result.error)
    if (!result.error) {
      setItems([...items, result.data.data])
      setNewLabel('')
    }
  }

  async function handleToggle(item) {
    const isDone = !item.isDone
    const result = await requestJson(`/api/checklist/${item.id}`, {
      method: 'PATCH',
      body: { isDone },
    })
    setError(result.error)
    if (!result.error) {
      setItems(items.map((other) => (other.id === item.id ? { ...other, isDone } : other)))
    }
  }

  async function handleRemove(id) {
    const result = await requestJson(`/api/checklist/${id}`, { method: 'DELETE' })
    setError(result.error)
    if (!result.error) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const doneCount = items.filter((item) => item.isDone).length

  return (
    <section className="dash-card" aria-labelledby="checklist-title">
      <SectionHeading id="checklist-title" icon="check">Exchange checklist</SectionHeading>
      <progress max={items.length || 1} value={doneCount} aria-label="Checklist progress" />
      <p className="dash-meta">
        {doneCount} of {items.length} done
      </p>

      {isLoading && <p role="status">Loading checklist…</p>}
      {error && <p className="status-message status-message--error" role="alert">{error}</p>}

      <ul className="dash-list">
        {items.map((item) => (
          <li key={item.id} className="dash-row">
            <label>
              <input
                type="checkbox"
                checked={item.isDone}
                onChange={() => handleToggle(item)}
              />{' '}
              {item.label}
            </label>
            <button
              type="button"
              className="dash-remove"
              aria-label={`Remove ${item.label}`}
              onClick={() => handleRemove(item.id)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <form className="dash-form" onSubmit={handleAdd}>
        <label className="dash-field dash-field-grow">
          Add an item
          <input
            maxLength={150}
            onChange={(event) => setNewLabel(event.target.value)}
            placeholder="e.g. Buy a SIM card"
            required
            value={newLabel}
          />
        </label>
        <Button type="submit" size="small">Add</Button>
      </form>
    </section>
  )
}

export default Checklist