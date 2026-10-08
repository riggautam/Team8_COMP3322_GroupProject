import Footer from './global/Footer.jsx'
import Navbar from './global/Navbar.jsx'
import Home from './home/Home.jsx'
import TransferCredit from './transfer_credit/TransferCredit.jsx'

function App() {
  const isTransferCreditPage =
    window.location.pathname.replace(/\/+$/, '') === '/transfer-credits'

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-content">
        {isTransferCreditPage ? <TransferCredit /> : <Home />}
      </main>
      <Footer />
    </div>
  )
}

export default App
