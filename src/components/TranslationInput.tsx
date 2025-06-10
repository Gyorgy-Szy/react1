import { useState, useEffect } from 'react'

interface TranslationInputProps {
  translationKey: string
  value: string
  selectedLanguage: string
  onSave: (key: string, value: string) => void
  className?: string
}

export default function TranslationInput({ translationKey, value, selectedLanguage, onSave, className }: TranslationInputProps) {
  const [isEditing, setIsEditing] = useState(false)
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
    setEditValue(value)
    setOriginalValue(value)
    
    // Fetch English translation if current language is not English
    if (selectedLanguage !== 'en') {
      try {
        const response = await fetch(`/api/translations/en`)
        if (response.ok) {
          const data = await response.json()
          setEnglishValue(data.translations[translationKey] || '')
        }
      } catch (error) {
        console.error('Error fetching English translation:', error)
      }
    }
    
    setIsEditing(true)
  }

  return (
    <div className="card-small">
      <div className="mb-1">
        <div className="translation-item">
          <span className="translation-label">{translationKey}</span>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="btn"
              title="Edit"
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
                <span className="reference-text">{originalValue}</span>
              </div>
            )}
            {selectedLanguage !== 'en' && englishValue && (
              <div className="reference-value">
                <span className="reference-label">English:</span>
                <span className="reference-text">{englishValue}</span>
              </div>
            )}
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="Enter translation"
              autoFocus
              className="input input-full"
            />
            <div className="translation-actions">
              <button
                onClick={handleSave}
                className="btn-save"
              >
                ✅ Save
              </button>
              <button
                onClick={handleCancel}
                className="btn-cancel"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="translation-value">
            {value || <span className="translation-empty">No translation</span>}
          </div>
        )}
      </div>
    </div>
  )
}