import { lazy, Suspense } from 'react'
import { Navigate, Routes, Route, useLocation } from 'react-router'
import Footer from './components/layout/Footer.jsx'
import Navbar from './components/layout/Navbar.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'
import LoadingSpinner from './components/ui/LoadingSpinner.jsx'
import { useAuth } from './contexts/AuthContext.jsx'
const LandingPage = lazy(() => import('./pages/landing/LandingPage.jsx'))
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard.jsx'))
const MapPage = lazy(() => import('./pages/map/MapPage.jsx'))
const TransferCredit = lazy(() => import('./pages/transfer_credit/TransferCredit.jsx'))
const Blog = lazy(() => import('./pages/blog/Blog.jsx'))
const EventsPage = lazy(() => import('./pages/events/EventsPage.jsx'))
const Login = lazy(() => import('./pages/login/Login.jsx'))
const AdminPage = lazy(() => import('./pages/admin/AdminPage.jsx'))
const PrivacyPage = lazy(() => import('./pages/legal/PrivacyPage.jsx'))
const TermsPage = lazy(() => import('./pages/legal/TermsPage.jsx'))
const CreditsPage = lazy(() => import('./pages/legal/CreditsPage.jsx'))

function App() {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  
  // Wait for /api/auth/me, or a refresh would briefly look logged out and redirect.
  if (isLoading) return null
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-content">
        {/* key: a new page gets a fresh ErrorBoundary, so an error on one page doesn't stick. */}
        <ErrorBoundary key={location.pathname}>
          {/* Shown while a page's code downloads (each page is loaded only when first opened). */}
          <Suspense fallback={<LoadingSpinner label="Loading page" />}>
            <Routes>
              <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
              <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/transfer-credits" element={<TransferCredit />} />
              <Route path="/login" element={<Login />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/credits" element={<CreditsPage />} />
              {/* Only admins see this page. The admin API checks the role again, so this is
                  just to keep everyone else away from an empty page of errors. */}
              <Route
                path="/admin"
                element={user?.role === 'admin' ? <AdminPage /> : <Navigate to="/" replace />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}

export default App