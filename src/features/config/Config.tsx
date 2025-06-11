import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getAvailableLanguages } from '../../i18n-backend'
import Header from '../../components/Header'
import TranslationInput from './components/TranslationInput'
import DelaySettings from './components/DelaySettings'
import LoadingSpinner from '../../components/LoadingSpinner'

interface Translation {
  key: string
  value: string
}

function Config() {
  const { t } = useTranslation(['config', 'general'], { useSuspense: true })
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
        // Flatten the namespaced translations for editing
        const translationArray: Translation[] = []
        Object.entries(data.translations).forEach(([namespace, translations]) => {
          Object.entries(translations as Record<string, string>).forEach(([key, value]) => {
            translationArray.push({
              key: `${namespace}:${key}`,
              value: value as string
            })
          })
        })
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
      // Parse namespace and key from the full key (namespace:key)
      const [namespace, translationKey] = key.split(':')
      if (!namespace || !translationKey) {
        throw new Error('Invalid key format')
      }
      
      const response = await fetch(`/api/translations/${selectedLanguage}/${namespace}/${translationKey}`, {
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
        setSaveMessage(t('config:translationSaved', { key }))
        setSaveType('success')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage(t('config:translationError', { key }))
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
          <h1 className="text-large">{t('config:title')}</h1>
          <p className="text-muted">
            {t('config:subtitle')}
          </p>
        </div>

        <div className="card">
          <div className="mb-3">
            <h2 className="text-medium flex items-center gap-small">
              ⚙️ {t('config:delaySettings')}
            </h2>
            <p className="text-muted text-small">
              {t('config:delaySettingsDesc')}
            </p>
          </div>
          
          <DelaySettings onSaveMessage={(message, type) => {
            setSaveMessage(message)
            setSaveType(type)
          }} />
        </div>

        <div className="card">
          <div className="mb-3">
            <h2 className="text-medium flex items-center gap-small">
              🌐 {t('config:translationEditor')}
            </h2>
            <p className="text-muted text-small">
              {t('config:translationEditorDesc')}
            </p>
          </div>
          
          <div className="mb-2">
            <div className="flex items-center gap-small mb-2">
              <span className="text-small text-bold">{t('config:selectLanguage')}</span>
              <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="select select-lang"
              >
                <option value="" disabled>{t('config:chooseLanguage')}</option>
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
              <LoadingSpinner message={t('config:loadingTranslations')} />
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
                    {t('config:noTranslations')}
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