import { useState, useEffect } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { getAvailableLanguages } from './i18n-backend'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const [count, setCount] = useState(0)
  const [availableLanguages, setAvailableLanguages] = useState<Array<{code: string, name: string}>>([])
  const [isChangingLanguage, setIsChangingLanguage] = useState(false)
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  useEffect(() => {
    const loadLanguages = async () => {
      const languages = await getAvailableLanguages()
      setAvailableLanguages(languages)
    }
    loadLanguages()
  }, [])

  const changeLanguage = async (lng: string) => {
    if (lng === i18n.language) return // Don't reload if same language
    
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
    <>
      <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span>{t('language')}: </span>
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              style={{
                margin: '0 5px',
                padding: '5px 10px',
                backgroundColor: i18n.language === lang.code ? '#646cff' : '#f9f9f9',
                color: i18n.language === lang.code ? 'white' : 'black',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {lang.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => navigate('/config')}
          style={{
            background: '#646cff',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}
          title={t('configuration')}
        >
          ⚙️
        </button>
      </div>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>{t('title')}</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          {t('count', { count })}
        </button>
        <p>
          <Trans i18nKey="edit">
            Edit <code>src/App.tsx</code> and save to test HMR
          </Trans>
        </p>
      </div>
      <p className="read-the-docs">
        {t('clickLogos')}
      </p>
    </>
  )
}

export default App
