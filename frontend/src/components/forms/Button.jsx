import './Button.css'

function Button({
  children,
  disabled = false,
  onClick,
  size = 'medium',
  type = 'button',
  className = '',
  ...props
}) {
  return (
    <button
      className={`global-button global-button--${size} ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
