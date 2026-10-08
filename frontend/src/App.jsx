import Footer from './global/Footer.jsx'
import Navbar from './global/Navbar.jsx'
import Dashboard from './dashboard/Dashboard.jsx'
import Home from './home/Home.jsx'
import TransferCredit from './transfer_credit/TransferCredit.jsx'

function App() {
  const path = window.location.pathname.replace(/\/+$/, '')
  const isTransferCreditPage = path === '/transfer-credits'
  const isDashboardPage = path === '/dashboard'

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-content">
        {isTransferCreditPage ? <TransferCredit /> : isDashboardPage ? <Dashboard /> : <Home />}
      </main>
      <Footer />
    </div>
  )
}

export default App
