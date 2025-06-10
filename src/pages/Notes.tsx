import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import NoteInput from '../components/NoteInput'
import LoadingSpinner from '../components/LoadingSpinner'

interface Note {
  id: number
  content: string
  created_at: string
  updated_at: string
}

function Notes() {
  const { t } = useTranslation()
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveType, setSaveType] = useState<'success' | 'error'>('success')
  const [showNewNote, setShowNewNote] = useState(false)

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/notes')
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes)
        setSaveMessage('')
      } else {
        throw new Error('Failed to load notes')
      }
    } catch (error) {
      console.error('Error loading notes:', error)
      setSaveMessage('Error loading notes')
      setSaveType('error')
    } finally {
      setIsLoading(false)
    }
  }

  const saveNote = async (noteId: number | null, content: string) => {
    try {
      let response
      
      if (noteId) {
        // Update existing note
        response = await fetch(`/api/notes/${noteId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content })
        })
      } else {
        // Create new note
        response = await fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content })
        })
      }

      if (response.ok) {
        setSaveMessage(noteId ? 'Note updated successfully!' : 'Note created successfully!')
        setSaveType('success')
        setTimeout(() => setSaveMessage(''), 3000)
        
        // Reload notes to get updated list
        await loadNotes()
        setShowNewNote(false)
      } else {
        throw new Error('Failed to save note')
      }
    } catch (error) {
      console.error('Error saving note:', error)
      setSaveMessage('Error saving note')
      setSaveType('error')
    }
  }

  const deleteNote = async (noteId: number) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return
    }

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSaveMessage('Note deleted successfully!')
        setSaveType('success')
        setTimeout(() => setSaveMessage(''), 3000)
        
        // Remove note from local state
        setNotes(prev => prev.filter(note => note.id !== noteId))
      } else {
        throw new Error('Failed to delete note')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      setSaveMessage('Error deleting note')
      setSaveType('error')
    }
  }

  return (
    <div className="page">
      <Header />
      <div className="page-content">
        <div className="page-header">
          <h1 className="text-large">Notes</h1>
          <p className="text-muted">
            Keep track of your development notes and implementation tips
          </p>
        </div>

        <div className="card">
          <div className="mb-3">
            <h2 className="text-medium flex items-center gap-small">
              📝 Development Notes
            </h2>
            <p className="text-muted text-small">
              Add, edit, and manage your notes. Click edit to modify existing notes.
            </p>
          </div>
          
          <div className="mb-2">
            <button 
              onClick={() => setShowNewNote(true)}
              className="btn-add"
              disabled={showNewNote}
            >
              ➕ Add New Note
            </button>
            
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
              <LoadingSpinner message="Loading notes..." />
            ) : (
              <div>
                {showNewNote && (
                  <NoteInput
                    onSave={saveNote}
                    isNew={true}
                  />
                )}
                
                {notes.map(note => (
                  <NoteInput
                    key={note.id}
                    note={note}
                    onSave={saveNote}
                    onDelete={deleteNote}
                  />
                ))}
                
                {notes.length === 0 && !showNewNote && (
                  <div className="empty-state">
                    No notes found. Click "Add New Note" to create your first note.
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

export default Notes