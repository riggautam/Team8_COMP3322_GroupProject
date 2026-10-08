import './Navbar.css'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/transfer-credits', label: 'Transfer Credits' },
]

function Navbar() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  return (
    <header className="site-header">
      <div className="navbar">
        <a className="navbar-brand" href="/" aria-label="WEST home">
          WEST
        </a>
        <nav className="navbar-links" aria-label="Main navigation">
          {LINKS.map(({ href, label }) => (
            <a key={href} href={href} aria-current={path === href ? 'page' : undefined}>
              {label}
            </a>
          ))}
        </nav>
        <div className="navbar-right" aria-hidden="true" />
      </div>
    </header>
  )
}

export default Navbar
