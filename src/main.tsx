import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import '@github/spark/spark'

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import './main.css'
import './styles/theme.css'
import './index.css'

function mount() {
  const container = document.getElementById('root')
  if (!container) {
    // In case script executes before DOM ready; retry after DOM content loaded
    document.addEventListener('DOMContentLoaded', mount, { once: true })
    return
  }
  createRoot(container).render(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  )
}

mount()
