const LINKS = [
  { href: '/map', title: 'Campus Map', text: 'Find classrooms and food' },
  { href: '/transfer-credits', title: 'Transfer Credits', text: 'Plan course equivalencies' },
  { href: '/blog', title: 'Blog', text: 'Read and share stories' },
]

function QuickLinks() {
  return (
    <nav className="dash-card" aria-labelledby="quick-links-title">
      <h2 id="quick-links-title">Quick links</h2>
      <ul className="dash-list">
        {LINKS.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.title}</a>
            <p className="dash-meta">{link.text}</p>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default QuickLinks
