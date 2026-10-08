import Footer from './components/Footer.jsx'
import Navbar from './components/Navbar.jsx'
import Home from './pages/home/Home.jsx'
import TransferCredit from './pages/transfer_credit/TransferCredit.jsx'
import Blog from './pages/Blog.jsx'

function App() {
  const isTransferCreditPage =
    window.location.pathname.replace(/\/+$/, '') === '/transfer-credits'
  const isBlogPage = window.location.pathname.replace(/\/+$/, '') === '/blog'

  return (
    <div className="app-shell">
      <Navbar />
      <main
        className={`page-content${isTransferCreditPage ? ' page-content--transfer-credit' : ''}`}
      >
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
