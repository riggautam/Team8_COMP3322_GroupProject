import './CategoryFilter.css'

// "All" plus one button per category. value is the chosen category, or '' for All.
// Used by the dashboard's events card and the events page.
function CategoryFilter({ categories, value, onChange, disabled = false }) {
  return (
    <ul className="category-filter" aria-label="Filter events by category">
      {['', ...categories].map((name) => (
        <li key={name || 'all'}>
          <button
            type="button"
            aria-pressed={value === name}
            disabled={disabled}
            onClick={() => onChange(name)}
          >
            {name || 'All'}
          </button>
        </li>
      ))}
    </ul>
  )
}

export default CategoryFilter
