import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getAvailableLanguages } from '../i18n-backend'
import LoadingSpinner from './LoadingSpinner'
import { isRTLLanguage } from '../utils/rtl'

function Header() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('general')
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


  if (isChangingLanguage) {
    return <LoadingSpinner message="Changing language..." />
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-nav">
          <button
            onClick={() => navigate('/')}
            title={t('home')}
            className="btn"
          >
            🏠
          </button>
          
          <h1 className="header-title">PoC for i18next</h1>
          
          <button
            onClick={() => navigate('/notes')}
            className="btn btn-with-text"
          >
            📝 <span>Notes</span>
          </button>
          
          <button
            onClick={() => navigate('/testbay')}
            className="btn btn-with-text"
          >
            🧪 <span>Testbay</span>
          </button>
        </div>
        
        <div className="header-nav">
          
          <button
            onClick={() => navigate('/config')}
            title="Configuration"
            className="btn"
          >
            ⚙️
          </button>
          
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
        </div>
      </div>
    </header>
  )
}

export default Header