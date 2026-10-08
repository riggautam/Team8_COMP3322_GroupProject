import Icon from './Icon.jsx'

function CardHeading({ id, icon, children }) {
  return (
    <h2 id={id} className="dash-heading">
      <span className="dash-heading-icon">
        <Icon name={icon} />
      </span>
      {children}
    </h2>
  )
}

export default CardHeading
