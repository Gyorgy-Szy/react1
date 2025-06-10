import { useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Header from './components/Header'

function App() {
  const [count, setCount] = useState(0)
  const { t } = useTranslation()

  return (
    <div className="page">
      <Header />
      <div className="page-content-large">
        <div className="flex flex-column items-center gap-large">
          <div className="flex items-center gap-large">
            <a
              href="https://vite.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a
              href="https://react.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={reactLogo}
                className="logo logo-spinning"
                alt="React logo"
              />
            </a>
          </div>

          <div className="text-center">
            <h1 className="text-large">
              {t('title')}
            </h1>
            <div className="badge">
              Vite + React + TypeScript
            </div>
          </div>

          <div className="card">
            <div className="text-center mb-2">
              <h2 className="text-medium">
                Interactive Counter
              </h2>
              <p className="text-small text-muted">
                Click the button to increment the counter
              </p>
            </div>
            
            <div className="mb-2">
              <div className="flex justify-center">
                <button
                  onClick={() => setCount((count) => count + 1)}
                  className="btn-primary"
                >
                  {t('count', { count })}
                </button>
              </div>
              
              <div className="text-center text-small text-muted mt-2">
                <Trans i18nKey="edit">
                  Edit <code>src/App.tsx</code> and save to test HMR
                </Trans>
              </div>
            </div>
          </div>

          <div className="text-center text-muted">
            {t('clickLogos')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
