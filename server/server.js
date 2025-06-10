import express from 'express';
import cors from 'cors';
import { getTranslations, getAllLanguages, updateTranslation, getAllNotes, createNote, updateNote, deleteNote } from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Get all available languages
app.get('/api/languages', (req, res) => {
  getAllLanguages((err, languages) => {
    if (err) {
      console.error('Error fetching languages:', err);
      res.status(500).json({ error: 'Failed to fetch languages' });
      return;
    }
    res.json({ languages });
  });
});

// Get translations for a specific language
app.get('/api/translations/:language', (req, res) => {
  const { language } = req.params;
  
  // Add 2 second delay to simulate loading
  setTimeout(() => {
    getTranslations(language, (err, translations) => {
      if (err) {
        console.error('Error fetching translations:', err);
        res.status(500).json({ error: 'Failed to fetch translations' });
        return;
      }
      
      if (Object.keys(translations).length === 0) {
        res.status(404).json({ error: 'Language not found' });
        return;
      }
      
      res.json({ 
        language,
        translations 
      });
    });
  }, 2000);
});

// Update a specific translation
app.put('/api/translations/:language/:key', (req, res) => {
  const { language, key } = req.params;
  const { value } = req.body;
  
  if (!value) {
    res.status(400).json({ error: 'Translation value is required' });
    return;
  }
  
  updateTranslation(language, key, value, (err, result) => {
    if (err) {
      console.error('Error updating translation:', err);
      if (err.message === 'Translation not found') {
        res.status(404).json({ error: 'Translation not found' });
      } else {
        res.status(500).json({ error: 'Failed to update translation' });
      }
      return;
    }
    
    res.json({ 
      success: true,
      language,
      key,
      value,
      changes: result.changes
    });
  });
});

// Notes endpoints
app.get('/api/notes', (req, res) => {
  getAllNotes((err, notes) => {
    if (err) {
      console.error('Error fetching notes:', err);
      res.status(500).json({ error: 'Failed to fetch notes' });
      return;
    }
    res.json({ notes });
  });
});

app.post('/api/notes', (req, res) => {
  const { content } = req.body;
  
  if (!content || content.trim() === '') {
    res.status(400).json({ error: 'Note content is required' });
    return;
  }
  
  createNote(content.trim(), (err, result) => {
    if (err) {
      console.error('Error creating note:', err);
      res.status(500).json({ error: 'Failed to create note' });
      return;
    }
    
    res.status(201).json({
      success: true,
      note: {
        id: result.id,
        content: result.content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    });
  });
});

app.put('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  
  if (!content || content.trim() === '') {
    res.status(400).json({ error: 'Note content is required' });
    return;
  }
  
  updateNote(parseInt(id), content.trim(), (err, result) => {
    if (err) {
      console.error('Error updating note:', err);
      if (err.message === 'Note not found') {
        res.status(404).json({ error: 'Note not found' });
      } else {
        res.status(500).json({ error: 'Failed to update note' });
      }
      return;
    }
    
    res.json({
      success: true,
      noteId: parseInt(id),
      content: content.trim(),
      changes: result.changes
    });
  });
});

app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  
  deleteNote(parseInt(id), (err, result) => {
    if (err) {
      console.error('Error deleting note:', err);
      if (err.message === 'Note not found') {
        res.status(404).json({ error: 'Note not found' });
      } else {
        res.status(500).json({ error: 'Failed to delete note' });
      }
      return;
    }
    
    res.json({
      success: true,
      noteId: parseInt(id),
      changes: result.changes
    });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Translation server running on http://localhost:${PORT}`);
});