import './Navbar.css'

function Navbar() {
  return (
    <header className="site-header">
      <div className="navbar">
        <a className="navbar-brand" href="/" aria-label="WEST home">
          WEST
        </a>
        <nav className="navbar-links" aria-label="Main navigation">
          <a href="/">Home</a>
          <a href="/blog">Blog</a>
          <a href="/transfer-credits">Transfer Credits</a>
        </nav>
        <div className="navbar-right" aria-hidden="true" />
      </div>
    </header>
  )
}

export default Navbar
