import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import './i18n-backend'
import App from './App.tsx'
import Config from './pages/Config.tsx'
import LoadingSpinner from './components/LoadingSpinner'
import { ThemeProvider } from './components/theme-provider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system">
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner message="Loading translations..." />}>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/config" element={<Config />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
