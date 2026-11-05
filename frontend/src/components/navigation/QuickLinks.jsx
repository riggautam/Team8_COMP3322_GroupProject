import { useId } from 'react'
import { Link } from 'react-router'
import SectionHeading from '../ui/SectionHeading.jsx'
import Icon from '../ui/Icon.jsx'

function QuickLinks({ links = [] }) {
  const titleId = useId()

  return (
    <nav className="dash-card" aria-labelledby={titleId}>
      <SectionHeading id={titleId} icon="link">Quick links</SectionHeading>
      <ul className="dash-list">
        {links.map((link) => (
          <li key={link.href}>
            <Link className="dash-tile" to={link.href}>
              <span className="section-heading-icon">
                <Icon name={link.icon} />
              </span>
              <span>
                <strong>{link.title}</strong>
                <span className="dash-meta">{link.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default QuickLinks
