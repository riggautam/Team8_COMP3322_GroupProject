import { Link } from 'react-router'
import './Footer.css'

function Footer() {
  return (
    <footer className="site-footer">
      <nav className="footer-links" aria-label="Site information">
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/terms">Terms &amp; Conditions</Link>
        <Link to="/credits">Credits</Link>
      </nav>
      <p>&copy; 2026 WEST, all rights reserved.</p>
    </footer>
  )
}

export default Footer
