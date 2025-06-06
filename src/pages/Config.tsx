import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getAvailableLanguages } from '../i18n-backend'
import Header from '../components/Header'
import './Config.css'

interface Translation {
  key: string
  value: string
}

function Config() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [availableLanguages, setAvailableLanguages] = useState<Array<{code: string, name: string}>>([])
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [translations, setTranslations] = useState<Translation[]>([])
  const [editedTranslations, setEditedTranslations] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

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
        setEditedTranslations({})
        setSaveMessage('')
      }
    } catch (error) {
      console.error('Error loading translations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTranslationChange = (key: string, value: string) => {
    setEditedTranslations(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const saveTranslation = async (key: string) => {
    const newValue = editedTranslations[key]
    if (!newValue) return

    try {
      const response = await fetch(`/api/translations/${selectedLanguage}/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value: newValue })
      })

      if (response.ok) {
        setTranslations(prev => 
          prev.map(t => t.key === key ? { ...t, value: newValue } : t)
        )
        setEditedTranslations(prev => {
          const updated = { ...prev }
          delete updated[key]
          return updated
        })
        setSaveMessage(`Translation "${key}" saved successfully!`)
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage(`Error saving translation "${key}"`)
      }
    } catch (error) {
      console.error('Error saving translation:', error)
      setSaveMessage(`Error saving translation "${key}"`)
    }
  }


  return (
    <>
      <Header />
      <div className="config-page page-content">
        <div className="config-header">
          <h1>{t('configuration')}</h1>
        </div>
      
      <div className="config-content">
        <div className="config-section">
          <h2>{t('general')}</h2>
          <div className="config-item">
            <label>{t('theme')}</label>
            <select>
              <option value="light">{t('light')}</option>
              <option value="dark">{t('dark')}</option>
            </select>
          </div>
        </div>
        
        <div className="config-section">
          <h2>{t('notifications')}</h2>
          <div className="config-item">
            <label>
              <input type="checkbox" />
              {t('enableNotifications')}
            </label>
          </div>
        </div>

        <div className="config-section">
          <h2>Translation Editor</h2>
          <div className="config-item">
            <label>Select Language:</label>
            <select 
              value={selectedLanguage} 
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {availableLanguages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          
          {saveMessage && (
            <div className={`save-message ${saveMessage.includes('Error') ? 'error' : 'success'}`}>
              {saveMessage}
            </div>
          )}

          {isLoading ? (
            <div className="loading">Loading translations...</div>
          ) : (
            <div className="translations-list">
              {translations.map(translation => (
                <div key={translation.key} className="translation-item">
                  <div className="translation-key">{translation.key}</div>
                  <div className="translation-input">
                    <input
                      type="text"
                      value={editedTranslations[translation.key] ?? translation.value}
                      onChange={(e) => handleTranslationChange(translation.key, e.target.value)}
                      placeholder={translation.value}
                    />
                    {editedTranslations[translation.key] && (
                      <button 
                        className="save-btn"
                        onClick={() => saveTranslation(translation.key)}
                      >
                        Save
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  )
}

export default Config