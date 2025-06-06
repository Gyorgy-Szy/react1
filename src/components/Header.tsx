import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getAvailableLanguages } from '../i18n-backend'
import LoadingSpinner from './LoadingSpinner'
import './Header.css'

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const [availableLanguages, setAvailableLanguages] = useState<Array<{code: string, name: string}>>([])
  const [isChangingLanguage, setIsChangingLanguage] = useState(false)

  useEffect(() => {
    const loadLanguages = async () => {
      const languages = await getAvailableLanguages()
      setAvailableLanguages(languages)
    }
    loadLanguages()
  }, [])

  const changeLanguage = async (lng: string) => {
    if (lng === i18n.language) return
    
    setIsChangingLanguage(true)
    try {
      await i18n.changeLanguage(lng)
    } finally {
      setIsChangingLanguage(false)
    }
  }

  const isHomePage = location.pathname === '/'

  if (isChangingLanguage) {
    return <LoadingSpinner message="Changing language..." />
  }

  return (
    <header className="app-header">
      <div className="header-left">
        {!isHomePage && (
          <button 
            className="home-button"
            onClick={() => navigate('/')}
            title="Home"
          >
            🏠
          </button>
        )}
      </div>
      
      <div className="header-right">
        <div className="language-dropdown">
          <label htmlFor="language-select">{t('language')}: </label>
          <select 
            id="language-select"
            value={i18n.language}
            onChange={(e) => changeLanguage(e.target.value)}
          >
            {availableLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        
        <button
          className="settings-button"
          onClick={() => navigate('/config')}
          title={t('configuration')}
        >
          ⚙️
        </button>
      </div>
    </header>
  )
}

export default Header