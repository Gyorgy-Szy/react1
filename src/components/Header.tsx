import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getAvailableLanguages } from '../i18n-backend'
import LoadingSpinner from './LoadingSpinner'
import { isRTLLanguage } from '../utils/rtl'

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
    <header className="header">
      <div className="header-content">
        <div className="header-nav">
          {!isHomePage && (
            <button
              onClick={() => navigate('/')}
              title="Home"
              className="btn"
            >
              🏠
            </button>
          )}
        </div>
        
        <div className="header-nav">
          <div className="header-controls">
            <span className="text-small text-muted">{t('language')}:</span>
            <select 
              value={i18n.language} 
              onChange={(e) => changeLanguage(e.target.value)}
              className="select"
              dir={isRTLLanguage(i18n.language) ? 'rtl' : 'ltr'}
            >
              {availableLanguages.map((lang) => (
                <option key={lang.code} value={lang.code} dir={isRTLLanguage(lang.code) ? 'rtl' : 'ltr'}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={() => navigate('/config')}
            title={t('configuration')}
            className="btn"
          >
            ⚙️
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header