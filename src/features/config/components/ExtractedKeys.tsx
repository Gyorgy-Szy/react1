import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import LoadingSpinner from '../../../components/LoadingSpinner'

interface ExtractedKey {
  id: number
  namespace: string
  translation_key: string
  file_path: string
  line_number: number
  usage_count: number
  last_extracted: string
  english_value: string | null
}

interface ExtractedKeysProps {
  onMessage: (message: string, type: 'success' | 'error') => void
}

function ExtractedKeys({ onMessage }: ExtractedKeysProps) {
  const { t } = useTranslation(['config', 'general'], { useSuspense: true })
  const [extractedKeys, setExtractedKeys] = useState<ExtractedKey[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [collapsedNamespaces, setCollapsedNamespaces] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadExtractedKeys()
  }, [])

  const loadExtractedKeys = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/extracted-keys')
      if (response.ok) {
        const data = await response.json()
        setExtractedKeys(data.keys)
        
        // Initially collapse all namespaces
        const namespaces = [...new Set(data.keys.map((key: ExtractedKey) => key.namespace))] as string[]
        setCollapsedNamespaces(new Set(namespaces))
      } else {
        throw new Error('Failed to load extracted keys')
      }
    } catch (error) {
      console.error('Error loading extracted keys:', error)
      onMessage('Error loading extracted keys', 'error')
    } finally {
      setIsLoading(false)
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
    setCollapsedNamespaces(new Set())
  }

  const formatNamespaceName = (namespace: string) => {
    return namespace.charAt(0).toUpperCase() + namespace.slice(1)
  }

  // Group keys by namespace
  const keysByNamespace = extractedKeys.reduce((groups, key) => {
    if (!groups[key.namespace]) {
      groups[key.namespace] = []
    }
    groups[key.namespace].push(key)
    return groups
  }, {} as Record<string, ExtractedKey[]>)

  // Sort namespaces and keys within each namespace
  const sortedNamespaces = Object.keys(keysByNamespace).sort()
  sortedNamespaces.forEach(namespace => {
    keysByNamespace[namespace].sort((a, b) => a.translation_key.localeCompare(b.translation_key))
  })

  if (isLoading) {
    return <LoadingSpinner message="Loading extracted keys..." />
  }

  return (
    <div className="extracted-keys">
      <div className="mb-2">
        <div className="extracted-keys-stats">
          <span className="text-small text-muted">
            Total: {extractedKeys.length} keys across {sortedNamespaces.length} namespaces
          </span>
        </div>
        
        {sortedNamespaces.length > 0 && (
          <div className="translations-controls">
            <button 
              onClick={openAllNamespaces}
              className="btn-toggle-all"
            >
              {t('config:openAll')}
            </button>
          </div>
        )}
        
        {sortedNamespaces.map(namespace => (
          <div key={namespace} className="namespace-group">
            <div 
              className="namespace-header"
              onClick={() => toggleNamespace(namespace)}
            >
              <div className="namespace-title">
                <svg 
                  className={`namespace-chevron ${!collapsedNamespaces.has(namespace) ? 'open' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>{formatNamespaceName(namespace)}</span>
                <span className="namespace-count">{keysByNamespace[namespace].length}</span>
              </div>
            </div>
            <div 
              className={`namespace-content ${collapsedNamespaces.has(namespace) ? 'collapsed' : 'expanded'}`}
            >
              <div className="namespace-translations">
                {keysByNamespace[namespace].map(key => (
                  <div key={key.id} className="extracted-key-item">
                    <div className="extracted-key-header">
                      <span className="extracted-key-name">
                        {key.translation_key}
                        {!key.english_value && (
                          <span className="missing-indicator"> (No English value)</span>
                        )}
                      </span>
                      <div className="extracted-key-meta">
                        <span className="usage-count" title="Usage count">
                          📊 {key.usage_count}
                        </span>
                        <span className="file-location" title="File location">
                          📁 {key.file_path}:{key.line_number}
                        </span>
                      </div>
                    </div>
                    {key.english_value && (
                      <div className="extracted-key-value">
                        <span className="extracted-key-label">English:</span>
                        <span className="extracted-key-text">{key.english_value}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        
        {sortedNamespaces.length === 0 && (
          <div className="empty-state">
            <p>No extracted keys found.</p>
            <p className="text-small text-muted">
              Run <code>npm run extract-keys</code> to scan your codebase for translation keys.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExtractedKeys