import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n-backend'
import App from './App.tsx'
import LoadingSpinner from './components/LoadingSpinner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<LoadingSpinner message="Loading translations..." />}>
      <App />
    </Suspense>
  </StrictMode>,
)
