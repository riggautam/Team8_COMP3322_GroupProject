import { NavLink, Link } from 'react-router'
import { useAuth } from '../hooks/authContext.js'
import './Navbar.css'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/blog', label: 'Blog' },
  { to: '/map', label: 'Map' },
  { to: '/transfer-credits', label: 'Transfer Credits' },
]

function Navbar() {
  const { user, logout } = useAuth()

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
        <div className="navbar-right">
          {user ? (
            <>
              <span>Hi, {user.displayName}</span>
              <button className="navbar-auth" type="button" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <NavLink className="navbar-auth" to="/login">
              Log in
            </NavLink>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar