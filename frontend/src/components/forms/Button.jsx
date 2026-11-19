import './Button.css'

function Button({
  as: Element = 'button',
  children,
  disabled = false,
  onClick,
  size = 'medium',
  type = 'button',
  variant = 'default',
  className = '',
  ...props
}) {
  return (
    <Element
      className={`global-button ${variant === 'custom' ? 'global-button--custom' : `global-button--${size}`} ${className}`.trim()}
      disabled={Element === 'button' ? disabled : undefined}
      onClick={onClick}
      type={Element === 'button' ? type : undefined}
      {...props}
    >
      {children}
    </Element>
  )
}

export default Button
