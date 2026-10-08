import CardHeading from './CardHeading.jsx'
import Icon from './Icon.jsx'

const LINKS = [
  { icon: 'map', href: '/map', title: 'Campus Map', text: 'Find classrooms and food' },
  { icon: 'book', href: '/transfer-credits', title: 'Transfer Credits', text: 'Plan course equivalencies' },
  { icon: 'pen', href: '/blog', title: 'Blog', text: 'Read and share stories' },
]

function QuickLinks() {
  return (
    <nav className="dash-card" aria-labelledby="quick-links-title">
      <CardHeading id="quick-links-title" icon="link">Quick links</CardHeading>
      <ul className="dash-list">
        {LINKS.map((link) => (
          <li key={link.href}>
            <a className="dash-tile" href={link.href}>
              <span className="dash-heading-icon">
                <Icon name={link.icon} />
              </span>
              <span>
                <strong>{link.title}</strong>
                <span className="dash-meta">{link.text}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default QuickLinks
