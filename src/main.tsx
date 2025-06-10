import { StrictMode, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './index.css'
import './i18n-backend'
import App from './App.tsx'
import Config from './pages/Config.tsx'
import Notes from './pages/Notes.tsx'
import LoadingSpinner from './components/LoadingSpinner'
import { setDocumentDirection } from './utils/rtl'

function AppWrapper() {
  const { i18n } = useTranslation()

  useEffect(() => {
    // Set initial direction
    setDocumentDirection(i18n.language)
    
    // Listen for language changes
    const handleLanguageChange = (lng: string) => {
      setDocumentDirection(lng)
    }
    
    i18n.on('languageChanged', handleLanguageChange)
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [i18n])

  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/config" element={<Config />} />
      <Route path="/notes" element={<Notes />} />
    </Routes>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner message="Loading translations..." />}>
        <AppWrapper />
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
