import './Button.css'

function Button({
  children,
  disabled = false,
  onClick,
  size = 'medium',
  type = 'button',
}) {
  return (
    <button
      className={`global-button global-button--${size}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  )
}

export default Button
