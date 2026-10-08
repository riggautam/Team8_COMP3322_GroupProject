import Footer from './global/Footer.jsx'
import Navbar from './global/Navbar.jsx'
import Home from './home/Home.jsx'
import TransferCredit from './transfer_credit/TransferCredit.jsx'
import Blog from './pages/Blog.jsx'

function App() {
  const isTransferCreditPage =
    window.location.pathname.replace(/\/+$/, '') === '/transfer-credits'
  const isBlogPage = window.location.pathname.replace(/\/+$/, '') === '/blog'

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-content">
        {isBlogPage ? (
          <Blog />
        ) : isTransferCreditPage ? (
          <TransferCredit />
        ) : (
          <Home />
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App
