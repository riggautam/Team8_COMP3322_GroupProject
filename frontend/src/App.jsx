import { lazy, Suspense } from 'react'
import { Navigate, Routes, Route } from 'react-router'
import Footer from './components/layout/Footer.jsx'
import Navbar from './components/layout/Navbar.jsx'
import { useAuth } from './contexts/AuthContext.jsx'
const LandingPage = lazy(() => import('./pages/landing/LandingPage.jsx'))
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard.jsx'))
const MapPage = lazy(() => import('./pages/map/MapPage.jsx'))
const TransferCredit = lazy(() => import('./pages/transfer_credit/TransferCredit.jsx'))
const Blog = lazy(() => import('./pages/blog/Blog.jsx'))
const Login = lazy(() => import('./pages/login/Login.jsx'))

function App() {
  const { user } = useAuth()

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-content">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/transfer-credits" element={<TransferCredit />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default App