import { useState } from 'react'
import CardHeading from './CardHeading.jsx'

const STORAGE_KEY = 'west-checklist'
const ITEMS = [
  { id: 'visa', label: 'Collect student visa / HKID' },
  { id: 'octopus', label: 'Get an Octopus card' },
  { id: 'bank', label: 'Open a local bank account' },
  { id: 'registration', label: 'Register for courses' },
  { id: 'mapping', label: 'Submit course mapping for approval' },
  { id: 'tour', label: 'Take a campus tour' },
]

function loadChecked() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function Checklist() {
  const [checked, setChecked] = useState(loadChecked)

  function toggle(id) {
    const next = checked.includes(id) ? checked.filter((x) => x !== id) : [...checked, id]
    setChecked(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Storage unavailable (e.g. private mode): keep in-memory state only.
    }
  }

  return (
    <section className="dash-card" aria-labelledby="checklist-title">
      <CardHeading id="checklist-title" icon="check">Exchange checklist</CardHeading>
      <progress max={ITEMS.length} value={checked.length} aria-label="Checklist progress" />
      <p className="dash-meta">
        {checked.length} of {ITEMS.length} done
      </p>
      <ul className="dash-list">
        {ITEMS.map((item) => (
          <li key={item.id}>
            <label>
              <input
                type="checkbox"
                checked={checked.includes(item.id)}
                onChange={() => toggle(item.id)}
              />{' '}
              {item.label}
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Checklist
