import './UrlInput.css'

function UrlInput({ id, label, value, onChange, placeholder = 'https://' }) {
  return (
    <div className="url-input">
      <label htmlFor={id}>{label}</label>
      <input
        autoComplete="url"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="url"
        value={value}
      />
    </div>
  )
}

export default UrlInput
