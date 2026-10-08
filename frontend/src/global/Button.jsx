import './Button.css'

function Button({ children, disabled = false, onClick, type = 'button' }) {
  return (
    <button
      className="global-button"
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  )
}

export default Button
