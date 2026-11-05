import { useId, useState } from 'react'
import Button from '../forms/Button.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'

function Checklist({
  items = [],
  error = null,
  isLoading = false,
  onAdd,
  onToggle,
  onRemove,
  title = 'Exchange checklist',
  addLabel = 'Add an item',
  placeholder = 'e.g. Buy a SIM card',
}) {
  const titleId = useId()
  const [newLabel, setNewLabel] = useState('')

  async function handleAdd(event) {
    event.preventDefault()
    if (await onAdd(newLabel)) setNewLabel('')
  }

  const doneCount = items.filter((item) => item.isDone).length

  return (
    <section className="dash-card" aria-labelledby={titleId}>
      <SectionHeading id={titleId} icon="check">{title}</SectionHeading>
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
                onChange={() => onToggle(item)}
              />{' '}
              {item.label}
            </label>
            <button
              type="button"
              className="dash-remove"
              aria-label={`Remove ${item.label}`}
              onClick={() => onRemove(item.id)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <form className="dash-form" onSubmit={handleAdd}>
        <label className="dash-field dash-field-grow">
          {addLabel}
          <input
            maxLength={150}
            onChange={(event) => setNewLabel(event.target.value)}
            placeholder={placeholder}
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