import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getAvailableLanguages } from '../../i18n-backend'
import Header from '../../components/Header'
import TranslationInput from './components/TranslationInput'
import DelaySettings from './components/DelaySettings'
import ExtractedKeys from './components/ExtractedKeys'
import LoadingSpinner from '../../components/LoadingSpinner'

interface Translation {
  key: string
  value: string
}

interface NamespaceGroup {
  namespace: string
  translations: Translation[]
}

interface ExtractedKey {
  namespace: string
  translation_key: string
  file_path: string
  line_number: number
  usage_count: number
}

function Config() {
  const { t } = useTranslation(['config', 'general'], { useSuspense: true })
  const [availableLanguages, setAvailableLanguages] = useState<Array<{code: string, name: string}>>([])
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [, setTranslations] = useState<Translation[]>([])
  const [namespaceGroups, setNamespaceGroups] = useState<NamespaceGroup[]>([])
  const [extractedKeys, setExtractedKeys] = useState<ExtractedKey[]>([])
  const [englishTranslations, setEnglishTranslations] = useState<Record<string, Record<string, string>>>({})
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
    loadExtractedKeys()
  }, [])

  const loadExtractedKeys = async () => {
    try {
      const response = await fetch('/api/extracted-keys')
      if (response.ok) {
        const data = await response.json()
        setExtractedKeys(data.keys)
      }
    } catch (error) {
      console.error('Error loading extracted keys:', error)
    }
  }

  useEffect(() => {
    if (selectedLanguage) {
      loadTranslations(selectedLanguage)
    }
  }, [selectedLanguage, extractedKeys])

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
      
      // Load English translations to find missing keys
      let englishTranslationsData: Record<string, Record<string, string>> = {}
      try {
        const englishResponse = await fetch(`/api/translations/en`)
        if (englishResponse.ok) {
          const englishData = await englishResponse.json()
          englishTranslationsData = englishData.translations
        }
      } catch (error) {
        console.error('Error loading English translations:', error)
      }
      
      // Store English translations in state for status detection
      setEnglishTranslations(englishTranslationsData)
      
      // Create a map of extracted keys for quick lookup
      const extractedKeysMap = new Map<string, ExtractedKey>()
      extractedKeys.forEach(key => {
        const fullKey = `${key.namespace}:${key.translation_key}`
        extractedKeysMap.set(fullKey, key)
      })
      
      // Combine all possible keys from translations and extracted keys
      const translationArray: Translation[] = []
      const groups: NamespaceGroup[] = []
      
      // Get all namespaces from translations and extracted keys
      const allNamespaces = new Set([
        ...Object.keys(currentTranslations),
        ...Object.keys(englishTranslations),
        ...extractedKeys.map(key => key.namespace)
      ])
      
      allNamespaces.forEach(namespace => {
        const currentNs = currentTranslations[namespace] || {}
        const englishNs = englishTranslationsData[namespace] || {}
        
        // Get all keys from all sources
        const allKeys = new Set([
          ...Object.keys(currentNs),
          ...Object.keys(englishNs),
          ...extractedKeys
            .filter(key => key.namespace === namespace)
            .map(key => key.translation_key)
        ])
        
        const namespaceTranslations: Translation[] = []
        
        // Create translations for all keys
        allKeys.forEach(key => {
          const fullKey = `${namespace}:${key}`
          
          const translation = {
            key: fullKey,
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

  const getNamespaceStatusCounts = (group: NamespaceGroup) => {
    const counts = {
      normal: 0,
      missing: 0,
      newInCode: 0,
      notUsed: 0
    }
    
    group.translations.forEach(translation => {
      const status = getTranslationStatus(translation.key, translation.value, selectedLanguage, englishTranslations)
      counts[status]++
    })
    
    return counts
  }

  const getTranslationStatus = (key: string, value: string, language: string, englishTranslations: Record<string, Record<string, string>>) => {
    const extractedKeysMap = new Map<string, ExtractedKey>()
    extractedKeys.forEach(extractedKey => {
      const fullKey = `${extractedKey.namespace}:${extractedKey.translation_key}`
      extractedKeysMap.set(fullKey, extractedKey)
    })
    
    const isInExtractedKeys = extractedKeysMap.has(key)
    const hasValue = value !== ''
    const isEnglish = language === 'en'
    
    // Check if key exists in English
    const [namespace, translationKey] = key.split(':')
    const existsInEnglish = englishTranslations[namespace]?.[translationKey] !== undefined
    
    // For English language: show indicators based on code usage
    if (isEnglish) {
      if (hasValue && !isInExtractedKeys) {
        return 'notUsed' // English translation exists but not used in code
      }
      if (isInExtractedKeys && !hasValue) {
        return 'newInCode' // Found in code but no English translation
      }
      return 'normal'
    }
    
    // For non-English languages: prioritize "Missing" over "New in code"
    if (!hasValue) {
      if (existsInEnglish) {
        return 'missing' // Missing translation (English exists)
      } else if (isInExtractedKeys) {
        return 'newInCode' // New in code (no English either)
      }
      return 'missing' // Default to missing for empty values
    }
    
    // For translations that exist but are not used in code
    if (hasValue && !isInExtractedKeys) {
      return 'notUsed'
    }
    
    return 'normal'
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
                
                {namespaceGroups.map(group => {
                  const statusCounts = getNamespaceStatusCounts(group)
                  
                  return (
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
                          <div className="namespace-counts">
                            <span className="namespace-count normal">{statusCounts.normal}</span>
                            {statusCounts.newInCode > 0 && (
                              <span className="namespace-count new-in-code">{statusCounts.newInCode}</span>
                            )}
                            {statusCounts.missing > 0 && (
                              <span className="namespace-count missing">{statusCounts.missing}</span>
                            )}
                            {statusCounts.notUsed > 0 && (
                              <span className="namespace-count not-used">{statusCounts.notUsed}</span>
                            )}
                          </div>
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
                            status={getTranslationStatus(translation.key, translation.value, selectedLanguage, englishTranslations)}
                            onSave={saveTranslation}
                            onDelete={deleteTranslation}
                            onAdd={addTranslation}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  )
                })}
                
                {namespaceGroups.length === 0 && (
                  <div className="empty-state">
                    {t('config:noTranslations')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="mb-3">
            <h2 className="text-medium flex items-center gap-small">
              🔍 {t('config:extractedKeys')}
            </h2>
            <p className="text-muted text-small">
              {t('config:extractedKeysDesc')}
            </p>
          </div>
          
          <ExtractedKeys onMessage={(message, type) => {
            setSaveMessage(message)
            setSaveType(type)
          }} />
        </div>
      </div>
    </div>
  )
}

export default Config