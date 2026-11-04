import { NavLink, Link } from 'react-router'
import { useAuth } from '../../contexts/AuthContext.jsx'
import './Navbar.css'

function Navbar() {
  const { user, logout } = useAuth()
  const links = [
    { to: user ? '/dashboard' : '/', label: user ? 'Dashboard' : 'Home' },
    { to: '/blog', label: 'Blog' },
    { to: '/map', label: 'Map' },
    { to: '/transfer-credits', label: 'Transfer Credits' },
  ]

  return (
    <header className="site-header">
      <div className="navbar">
        <Link className="navbar-brand" to="/" aria-label="WEST home">
          <img src="/west.png" alt="" />
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