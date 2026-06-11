import { Component } from 'react'
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // In production: send to error monitoring (Sentry, etc.)
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-white">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
            <FiAlertTriangle size={36} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-neutral-400 leading-relaxed mb-7">
            An unexpected error occurred. Please refresh the page or go back home.
          </p>
          {this.state.error?.message && (
            <div className="bg-neutral-50 rounded-xl p-3 mb-6 text-left">
              <p className="text-xs font-mono text-neutral-500 break-all">{this.state.error.message}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 flex items-center justify-center gap-2 border border-neutral-200 text-neutral-700 font-semibold py-3 rounded-xl hover:bg-neutral-50 transition-colors text-sm">
              <FiRefreshCw size={14} /> Refresh
            </button>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}
              className="flex-1 flex items-center justify-center gap-2 bg-neutral-900 text-white font-semibold py-3 rounded-xl hover:bg-neutral-800 transition-colors text-sm">
              <FiHome size={14} /> Go home
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary
