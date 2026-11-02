import { Link } from 'react-router'
import SectionHeading from '../ui/SectionHeading.jsx'
import Icon from '../ui/Icon.jsx'

const LINKS = [
  { icon: 'map', href: '/map', title: 'Campus Map', text: 'Find classrooms and food' },
  { icon: 'book', href: '/transfer-credits', title: 'Transfer Credits', text: 'Plan course equivalencies' },
  { icon: 'pen', href: '/blog', title: 'Blog', text: 'Read and share stories' },
]

function QuickLinks() {
  return (
    <nav className="dash-card" aria-labelledby="quick-links-title">
      <SectionHeading id="quick-links-title" icon="link">Quick links</SectionHeading>
      <ul className="dash-list">
        {LINKS.map((link) => (
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
