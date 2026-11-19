import { NavLink, Link } from 'react-router'
import { useAuth } from '../../contexts/AuthContext.jsx'
import Button from '../forms/Button.jsx'
import './Navbar.css'

function Navbar() {
  const { user, logout } = useAuth()
  const links = [
    { to: user ? '/dashboard' : '/', label: user ? 'Dashboard' : 'Home' },
    { to: '/events', label: 'Events' },
    { to: '/blog', label: 'Blog' },
    { to: '/map', label: 'Map' },
    { to: '/transfer-credits', label: 'Transfer Credits' },
    // Only admins get a link to the moderation page.
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <header className="site-header">
      <div className="navbar">
        <Link className="navbar-brand" to="/" aria-label="WEST home">
          <img src="/west.webp" alt="" />
        </Link>
        <nav className="navbar-links" aria-label="Main navigation">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="navbar-right">
          {user ? (
            <>
              <span>Hi, {user.displayName}</span>
              <Button variant="custom" className="navbar-auth" type="button" onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <Button as={NavLink} variant="custom" className="navbar-auth" to="/login">
              Log in
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar