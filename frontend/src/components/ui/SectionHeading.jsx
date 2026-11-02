import Icon from './Icon.jsx'
import './SectionHeading.css'

function SectionHeading({ id, icon, children }) {
  return (
    <h2 id={id} className="section-heading">
      {icon && (
        <span className="section-heading-icon">
          <Icon name={icon} />
        </span>
      )}
      {children}
    </h2>
  )
}

export default SectionHeading
