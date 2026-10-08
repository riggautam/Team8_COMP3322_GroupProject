import { Routes, Route, useLocation } from 'react-router'
import Footer from './components/Footer.jsx'
import Navbar from './components/Navbar.jsx'
import Home from './pages/home/Home.jsx'
import MapPage from './pages/map/MapPage.jsx'
import TransferCredit from './pages/transfer_credit/TransferCredit.jsx'
import Blog from './pages/Blog.jsx'

function App() {
  const { pathname } = useLocation()
  const mainClass =
    pathname === '/map'
      ? 'page-content map-layout'
      : pathname === '/transfer-credits'
        ? 'page-content page-content--transfer-credit'
        : 'page-content'

  return (
    <div className="app-shell">
      <Navbar />
      <main className={mainClass}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/transfer-credits" element={<TransferCredit />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App