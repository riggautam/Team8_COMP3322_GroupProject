import './TextInput.css'

function TextInput({
  id,
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
  placeholder = '',
  className = '',
}) {
  return (
    <div className={`text-input ${className}`.trim()}>
      <label htmlFor={id}>{label}</label>
      <input
        autoComplete={autoComplete}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </div>
  )
}

export default TextInput
