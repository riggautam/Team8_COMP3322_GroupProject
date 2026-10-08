import './TextField.css'

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder = '',
  rows = 6,
}) {
  return (
    <div className="text-field">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        value={value}
      />
    </div>
  )
}

export default TextField
