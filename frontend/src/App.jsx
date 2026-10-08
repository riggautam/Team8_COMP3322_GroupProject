import Footer from './components/Footer.jsx'
import Navbar from './components/Navbar.jsx'
import Home from './pages/home/Home.jsx'
import MapPage from './pages/map/MapPage.jsx'
import TransferCredit from './pages/transfer_credit/TransferCredit.jsx'
import Blog from './pages/Blog.jsx'

function currentPage() {
  const path = window.location.pathname.replace(/\/+$/, '')
  if (path === '/map') return 'map'
  if (path === '/transfer-credits') return 'transfer'
  if (path === '/blog') return 'blog'
  return 'home'
}

function App() {
  const page = currentPage()

  return (
    <div className="app-shell">
      <Navbar />
      <main
        className={
          page === 'map'
            ? 'page-content map-layout'
            : page === 'transfer'
              ? 'page-content page-content--transfer-credit'
              : 'page-content'
        }
      >
        {page === 'map' && <MapPage />}
        {page === 'blog' && <Blog />}
        {page === 'transfer' && <TransferCredit />}
        {page === 'home' && <Home />}
      </main>
      <Footer />
    </div>
  )
}

export default App
