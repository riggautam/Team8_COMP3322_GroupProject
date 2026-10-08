import Footer from './global/Footer.jsx'
import Navbar from './global/Navbar.jsx'
import Home from './home/Home.jsx'
import MapPage from './map/MapPage.jsx'
import TransferCredit from './transfer_credit/TransferCredit.jsx'

function currentPage() {
  // The other pages already do this with plain links, so /map follows that.
  const path = window.location.pathname.replace(/\/+$/, '')
  if (path === '/map') return 'map'
  if (path === '/transfer-credits') return 'transfer'
  return 'home'
}

function App() {
  const page = currentPage()

  return (
    <div className="app-shell">
      <Navbar />
      <main className={page === 'map' ? 'page-content map-layout' : 'page-content'}>
        {page === 'map' && <MapPage />}
        {page === 'transfer' && <TransferCredit />}
        {page === 'home' && <Home />}
      </main>
      <Footer />
    </div>
  )
}

export default App
