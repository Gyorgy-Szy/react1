import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Note {
  id: number
  content: string
  created_at: string
  updated_at: string
}

interface NoteInputProps {
  note?: Note
  onSave: (noteId: number | null, content: string) => void
  onDelete?: (noteId: number) => void
  isNew?: boolean
}

export default function NoteInput({ note, onSave, onDelete, isNew = false }: NoteInputProps) {
  const { t } = useTranslation(['general', 'notes'])
  const [isEditing, setIsEditing] = useState(isNew)
  const [isLoadingEdit, setIsLoadingEdit] = useState(false)
  const [editValue, setEditValue] = useState(note?.content || '')

  const handleSave = async () => {
    if (editValue.trim() === '') return
    
    setIsLoadingEdit(true)
    
    // Add delay to show loading indicator
    await new Promise(resolve => setTimeout(resolve, 300))
    
    onSave(note?.id || null, editValue.trim())
    setIsLoadingEdit(false)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(note?.content || '')
    setIsEditing(false)
  }

  const handleEdit = () => {
    setEditValue(note?.content || '')
    setIsEditing(true)
  }

  const handleDelete = () => {
    if (note?.id && onDelete) {
      onDelete(note.id)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (isNew && !isEditing) {
    return null
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
          {note && (
            <span className="translation-label">
              {formatDate(note.updated_at)}
            </span>
          )}
          {!isEditing && !isLoadingEdit && !isNew && (
            <div className="note-actions">
              <button
                onClick={handleEdit}
                className="btn"
                title={t('general:edit')}
              >
                ✏️
              </button>
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="btn"
                  title={t('general:delete')}
                >
                  🗑️
                </button>
              )}
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div className="mt-1">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={t('notes:enterNote')}
              autoFocus
              className="textarea textarea-full"
              rows={4}
            />
            <div className="translation-actions">
              <button
                onClick={handleSave}
                className="btn-save"
                disabled={editValue.trim() === ''}
              >
                ✅ {t('general:save')}
              </button>
              <button
                onClick={handleCancel}
                className="btn-cancel"
              >
                ❌ {t('general:cancel')}
              </button>
            </div>
          </div>
        ) : (
          note && (
            <div className="note-content">
              {note.content}
            </div>
          )
        )}
      </div>
    </div>
  )
}