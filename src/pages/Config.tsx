import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getAvailableLanguages } from '../i18n-backend'
import Header from '../components/Header'
import TranslationInput from '../components/TranslationInput'
import LoadingSpinner from '../components/LoadingSpinner'

interface Translation {
  key: string
  value: string
}

function Config() {
  const { t } = useTranslation()
  const [availableLanguages, setAvailableLanguages] = useState<Array<{code: string, name: string}>>([])
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [translations, setTranslations] = useState<Translation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveType, setSaveType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    const loadLanguages = async () => {
      const languages = await getAvailableLanguages()
      setAvailableLanguages(languages)
      if (languages.length > 0) {
        setSelectedLanguage(languages[0].code)
      }
    }
    loadLanguages()
  }, [])

  useEffect(() => {
    if (selectedLanguage) {
      loadTranslations(selectedLanguage)
    }
  }, [selectedLanguage])

  const loadTranslations = async (language: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/translations/${language}`)
      if (response.ok) {
        const data = await response.json()
        const translationArray = Object.entries(data.translations).map(([key, value]) => ({
          key,
          value: value as string
        }))
        setTranslations(translationArray)
        setSaveMessage('')
      }
    } catch (error) {
      console.error('Error loading translations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveTranslation = async (key: string, value: string) => {
    try {
      const response = await fetch(`/api/translations/${selectedLanguage}/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value })
      })

      if (response.ok) {
        setTranslations(prev => 
          prev.map(t => t.key === key ? { ...t, value } : t)
        )
        setSaveMessage(`Translation "${key}" saved successfully!`)
        setSaveType('success')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage(`Error saving translation "${key}"`)
        setSaveType('error')
      }
    } catch (error) {
      console.error('Error saving translation:', error)
      setSaveMessage(`Error saving translation "${key}"`)
      setSaveType('error')
    }
  }

  return (
    <div className="page">
      <Header />
      <div className="page-content">
        <div className="page-header">
          <h1 className="text-large">{t('configuration')}</h1>
          <p className="text-muted">
            Manage your application settings and translations
          </p>
        </div>

        <div className="card">
          <div className="mb-3">
            <h2 className="text-medium flex items-center gap-small">
              🌐 Translation Editor
            </h2>
            <p className="text-muted text-small">
              Edit translations for different languages. Changes are saved automatically.
            </p>
          </div>
          
          <div className="mb-2">
            <div className="flex items-center gap-small mb-2">
              <span className="text-small text-bold">Select Language:</span>
              <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="select select-lang"
              >
                <option value="">Choose language</option>
                {availableLanguages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            
            {saveMessage && (
              <div className={`alert ${saveType === 'error' ? 'alert-error' : 'alert-success'}`}>
                <div className="alert-content">
                  <span>{saveType === 'success' ? '✅' : '❌'}</span>
                  <span className={saveType === 'error' ? 'alert-text-error' : 'alert-text-success'}>
                    {saveMessage}
                  </span>
                </div>
              </div>
            )}

            {isLoading ? (
              <LoadingSpinner message="Loading translations..." />
            ) : (
              <div>
                {translations.map(translation => (
                  <TranslationInput
                    key={translation.key}
                    translationKey={translation.key}
                    value={translation.value}
                    selectedLanguage={selectedLanguage}
                    onSave={saveTranslation}
                  />
                ))}
                {translations.length === 0 && (
                  <div className="empty-state">
                    No translations found for this language.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Config