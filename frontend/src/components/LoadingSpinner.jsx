import './LoadingSpinner.css'

function LoadingSpinner({ label = 'Loading' }) {
  return (
    <span aria-label={label} className="loading-spinner" role="status">
      <span aria-hidden="true" />
    </span>
  )
}

export default LoadingSpinner
