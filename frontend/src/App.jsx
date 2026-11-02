import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router'
import Footer from './components/Footer.jsx'
import Navbar from './components/Navbar.jsx'
const Home = lazy(() => import('./pages/home/Home.jsx'))
const MapPage = lazy(() => import('./pages/map/MapPage.jsx'))
const TransferCredit = lazy(() => import('./pages/transfer_credit/TransferCredit.jsx'))
const Blog = lazy(() => import('./pages/Blog.jsx'))
const Login = lazy(() => import('./pages/login/Login.jsx'))

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-content">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/transfer-credits" element={<TransferCredit />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default App