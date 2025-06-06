import { useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { availableLanguages } from './i18n'

function App() {
  const [count, setCount] = useState(0)
  const { t, i18n } = useTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <>
      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
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
