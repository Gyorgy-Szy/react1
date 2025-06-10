interface LoadingSpinnerProps {
  message?: string
}

function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="loading-container">
      <div className="flex flex-column items-center gap-small">
        <div className="spinner"></div>
        <p className="text-small text-muted">{message}</p>
      </div>
    </div>
  )
}

export default LoadingSpinner