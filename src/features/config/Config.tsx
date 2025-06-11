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

interface NamespaceGroup {
  namespace: string
  translations: Translation[]
}

function Config() {
  const { t } = useTranslation(['config', 'general'], { useSuspense: true })
  const [availableLanguages, setAvailableLanguages] = useState<Array<{code: string, name: string}>>([])
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [translations, setTranslations] = useState<Translation[]>([])
  const [namespaceGroups, setNamespaceGroups] = useState<NamespaceGroup[]>([])
  const [collapsedNamespaces, setCollapsedNamespaces] = useState<Set<string>>(new Set())
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
      // Load current language translations
      const response = await fetch(`/api/translations/${language}`)
      let currentTranslations: Record<string, Record<string, string>> = {}
      
      if (response.ok) {
        const data = await response.json()
        currentTranslations = data.translations
      }
      
      // Load English translations to find missing keys (only if not English)
      let englishTranslations: Record<string, Record<string, string>> = {}
      if (language !== 'en') {
        try {
          const englishResponse = await fetch(`/api/translations/en`)
          if (englishResponse.ok) {
            const englishData = await englishResponse.json()
            englishTranslations = englishData.translations
          }
        } catch (error) {
          console.error('Error loading English translations:', error)
        }
      }
      
      // Combine current and missing translations
      const translationArray: Translation[] = []
      const groups: NamespaceGroup[] = []
      const allNamespaces = new Set([
        ...Object.keys(currentTranslations),
        ...Object.keys(englishTranslations)
      ])
      
      allNamespaces.forEach(namespace => {
        const currentNs = currentTranslations[namespace] || {}
        const englishNs = englishTranslations[namespace] || {}
        
        // Collect all keys (existing + missing) and create translations
        const allKeys = new Set([
          ...Object.keys(currentNs),
          ...(language !== 'en' ? Object.keys(englishNs) : [])
        ])
        
        const namespaceTranslations: Translation[] = []
        
        // Create translations for all keys
        allKeys.forEach(key => {
          const translation = {
            key: `${namespace}:${key}`,
            value: currentNs[key] || '' // Empty if missing
          }
          translationArray.push(translation)
          namespaceTranslations.push(translation)
        })
        
        // Sort translations alphabetically by key
        namespaceTranslations.sort((a, b) => {
          const keyA = a.key.split(':')[1] // Get the key part after namespace
          const keyB = b.key.split(':')[1]
          return keyA.localeCompare(keyB)
        })
        
        if (namespaceTranslations.length > 0) {
          groups.push({
            namespace,
            translations: namespaceTranslations
          })
        }
      })
      
      setTranslations(translationArray)
      setNamespaceGroups(groups)
      
      // Initially collapse all namespaces
      setCollapsedNamespaces(new Set(groups.map(g => g.namespace)))
      setSaveMessage('')
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

  const deleteTranslation = async (key: string) => {
    if (!window.confirm(t('config:removeConfirm'))) {
      return
    }

    try {
      // Parse namespace and key from the full key (namespace:key)
      const [namespace, translationKey] = key.split(':')
      if (!namespace || !translationKey) {
        throw new Error('Invalid key format')
      }
      
      const response = await fetch(`/api/translations/${selectedLanguage}/${namespace}/${translationKey}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSaveMessage(t('config:translationRemoved'))
        setSaveType('success')
        setTimeout(() => setSaveMessage(''), 3000)
        
        // Reload translations to get updated list
        await loadTranslations(selectedLanguage)
      } else {
        throw new Error('Failed to delete translation')
      }
    } catch (error) {
      console.error('Error deleting translation:', error)
      setSaveMessage(t('config:removeError'))
      setSaveType('error')
    }
  }

  const addTranslation = async (key: string, value: string) => {
    try {
      // Parse namespace and key from the full key (namespace:key)
      const [namespace, translationKey] = key.split(':')
      if (!namespace || !translationKey) {
        throw new Error('Invalid key format')
      }
      
      const response = await fetch(`/api/translations/${selectedLanguage}/${namespace}/${translationKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value })
      })

      if (response.ok) {
        setSaveMessage(t('config:translationAdded'))
        setSaveType('success')
        setTimeout(() => setSaveMessage(''), 3000)
        
        // Reload translations to get updated list
        await loadTranslations(selectedLanguage)
      } else {
        throw new Error('Failed to add translation')
      }
    } catch (error) {
      console.error('Error adding translation:', error)
      setSaveMessage(t('config:addError'))
      setSaveType('error')
    }
  }

  const toggleNamespace = (namespace: string) => {
    setCollapsedNamespaces(prev => {
      const newSet = new Set(prev)
      if (newSet.has(namespace)) {
        newSet.delete(namespace)
      } else {
        newSet.add(namespace)
      }
      return newSet
    })
  }

  const openAllNamespaces = () => {
    // Always open all namespaces
    setCollapsedNamespaces(new Set())
  }

  const formatNamespaceName = (namespace: string) => {
    return namespace.charAt(0).toUpperCase() + namespace.slice(1)
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
                {namespaceGroups.length > 0 && (
                  <div className="translations-controls">
                    <button 
                      onClick={openAllNamespaces}
                      className="btn-toggle-all"
                    >
                      {t('config:openAll')}
                    </button>
                  </div>
                )}
                
                {namespaceGroups.map(group => (
                  <div key={group.namespace} className="namespace-group">
                    <div 
                      className="namespace-header"
                      onClick={() => toggleNamespace(group.namespace)}
                    >
                      <div className="namespace-title">
                        <svg 
                          className={`namespace-chevron ${!collapsedNamespaces.has(group.namespace) ? 'open' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span>{formatNamespaceName(group.namespace)}</span>
                        <span className="namespace-count">{group.translations.length}</span>
                      </div>
                    </div>
                    <div 
                      className={`namespace-content ${collapsedNamespaces.has(group.namespace) ? 'collapsed' : 'expanded'}`}
                    >
                      <div className="namespace-translations">
                        {group.translations.map(translation => (
                          <TranslationInput
                            key={translation.key}
                            translationKey={translation.key}
                            value={translation.value}
                            selectedLanguage={selectedLanguage}
                            onSave={saveTranslation}
                            onDelete={deleteTranslation}
                            onAdd={addTranslation}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                {namespaceGroups.length === 0 && (
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