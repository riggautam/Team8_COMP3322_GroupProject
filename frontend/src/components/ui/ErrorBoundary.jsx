import { Component } from 'react'
import './ErrorBoundary.css'

// If a page crashes while drawing (a bug, or a page file that failed to download after a new
// deployment), show a short message instead of a blank site. The navbar and footer stay.
// React only offers this as a class component: getDerivedStateFromError runs when anything
// inside throws, and componentDidCatch logs the details for us.
// App.jsx gives it a new key on every page change, so going to another page clears the error.
class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Page crashed:', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <section className="error-boundary" role="alert">
        <h1>Something went wrong</h1>
        <p>This page ran into a problem. Reloading usually fixes it.</p>
        <div className="error-boundary-actions">
          <button type="button" onClick={() => window.location.reload()}>
            Reload the page
          </button>
          {/* A plain link, so the whole site loads fresh. */}
          <a href="/">Go to the home page</a>
        </div>
      </section>
    )
  }
}

export default ErrorBoundary
