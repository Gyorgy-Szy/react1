import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isRTLLanguage } from '../../../utils/rtl'

interface TranslationInputProps {
  translationKey: string
  value: string
  selectedLanguage: string
  onSave: (key: string, value: string) => void
}

export default function TranslationInput({ translationKey, value, selectedLanguage, onSave }: TranslationInputProps) {
  const { t } = useTranslation('general')
  const [isEditing, setIsEditing] = useState(false)
  const [isLoadingEdit, setIsLoadingEdit] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [originalValue, setOriginalValue] = useState('')
  const [englishValue, setEnglishValue] = useState('')

  const handleSave = () => {
    onSave(translationKey, editValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleEdit = async () => {
    setIsLoadingEdit(true)
    setEditValue(value)
    setOriginalValue(value)
    
    // Fetch English translation if current language is not English
    if (selectedLanguage !== 'en') {
      try {
        if (translationKey.includes(':')) {
          const [namespace, key] = translationKey.split(':')
          const response = await fetch(`/api/translations/en/${namespace}/${key}`)
          if (response.ok) {
            const data = await response.json()
            setEnglishValue(data.value || '')
          } else if (response.status === 404) {
            // Translation not found in English
            setEnglishValue('')
          }
        } else {
          // Fallback for old format - this shouldn't happen with current data structure
          console.warn('Translation key without namespace:', translationKey)
          setEnglishValue('')
        }
      } catch (error) {
        console.error('Error fetching English translation:', error)
        setEnglishValue('')
      }
    }
    
    setIsLoadingEdit(false)
    setIsEditing(true)
  }

  return (
    <div className="card-small translation-card">
      {isLoadingEdit && (
        <div className="translation-loading-overlay">
          <div className="translation-mini-spinner"></div>
        </div>
      )}
      <div className="mb-1">
        <div className="translation-item">
          <span className="translation-label">{translationKey}</span>
          {!isEditing && !isLoadingEdit && (
            <button
              onClick={handleEdit}
              className="btn"
              title={t('edit')}
            >
              ✏️
            </button>
          )}
        </div>
        
        {isEditing ? (
          <div className="mt-1">
            {originalValue && (
              <div className="reference-value">
                <span className="reference-label">Original:</span>
                <span className="reference-text" dir={isRTLLanguage(selectedLanguage) ? 'rtl' : 'ltr'}>{originalValue}</span>
              </div>
            )}
            {selectedLanguage !== 'en' && englishValue && (
              <div className="reference-value">
                <span className="reference-label">English:</span>
                <span className="reference-text" dir="ltr">{englishValue}</span>
              </div>
            )}
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="Enter translation"
              autoFocus
              className="input input-full"
              dir={isRTLLanguage(selectedLanguage) ? 'rtl' : 'ltr'}
            />
            <div className="translation-actions">
              <button
                onClick={handleSave}
                className="btn-save"
              >
                ✅ {t('save')}
              </button>
              <button
                onClick={handleCancel}
                className="btn-cancel"
              >
                ❌ {t('cancel')}
              </button>
            </div>
          </div>
        ) : (
          <div className="translation-value" dir={isRTLLanguage(selectedLanguage) ? 'rtl' : 'ltr'}>
            {value || <span className="translation-empty">No translation</span>}
          </div>
        )}
      </div>
    </div>
  )
}