import { NavLink, Link } from 'react-router'
import './Navbar.css'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/blog', label: 'Blog' },
  { to: '/map', label: 'Map' },
  { to: '/transfer-credits', label: 'Transfer Credits' },
]

function Navbar() {
  return (
    <header className="site-header">
      <div className="navbar">
        <Link className="navbar-brand" to="/" aria-label="WEST home">
          WEST
        </Link>
        <nav className="navbar-links" aria-label="Main navigation">
          {LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="navbar-right" aria-hidden="true" />
      </div>
    </header>
  )
}

export default Navbar