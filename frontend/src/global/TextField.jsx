import './TextField.css'

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder = '',
  rows = 6,
  invalid = false,
  readOnly = false,
}) {
  return (
    <div className="text-field">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        aria-invalid={invalid}
        placeholder={placeholder}
        readOnly={readOnly}
        rows={rows}
        value={value}
        onChange={
          readOnly ? undefined : (event) => onChange(event.target.value)
        }
      />
    </div>
  )
}

export default TextField
