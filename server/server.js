import express from 'express';
import cors from 'cors';
import { getTranslations, getTranslationsByNamespace, getAllLanguages, updateTranslation, getAllNotes, createNote, updateNote, deleteNote, getAllDelaySettings, getDelayForEndpoint, updateDelaySettings, getSingleTranslation } from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Get all available languages
app.get('/api/languages', (req, res) => {
  getDelayForEndpoint('languages', (delayErr, delay) => {
    if (delayErr) {
      console.error('Error fetching delay setting:', delayErr);
      delay = 0; // Fallback to no delay
    }
    
    setTimeout(() => {
      getAllLanguages((err, languages) => {
        if (err) {
          console.error('Error fetching languages:', err);
          res.status(500).json({ error: 'Failed to fetch languages' });
          return;
        }
        res.json({ languages });
      });
    }, delay);
  });
});

// Get a single translation value
app.get('/api/translations/:language/:namespace/:key', (req, res) => {
  const { language, namespace, key } = req.params;
  
  getDelayForEndpoint('translations_single_value', (delayErr, delay) => {
    if (delayErr) {
      console.error('Error fetching delay setting:', delayErr);
      delay = 0; // Fallback to no delay for single values
    }
    
    setTimeout(() => {
      getSingleTranslation(language, namespace, key, (err, value) => {
        if (err) {
          console.error('Error fetching single translation:', err);
          res.status(500).json({ error: 'Failed to fetch translation' });
          return;
        }
        
        if (value === null) {
          res.status(404).json({ error: 'Translation not found' });
          return;
        }
        
        res.json({ 
          language,
          namespace,
          key,
          value 
        });
      });
    }, delay);
  });
});

// Get translations for a specific language and namespace
app.get('/api/translations/:language/:namespace', (req, res) => {
  const { language, namespace } = req.params;
  
  getDelayForEndpoint('translations_single_namespace', (delayErr, delay) => {
    if (delayErr) {
      console.error('Error fetching delay setting:', delayErr);
      delay = 500; // Fallback to 500ms delay
    }
    
    setTimeout(() => {
      getTranslations(language, namespace, (err, translations) => {
        if (err) {
          console.error('Error fetching translations:', err);
          res.status(500).json({ error: 'Failed to fetch translations' });
          return;
        }
        
        if (Object.keys(translations).length === 0) {
          res.status(404).json({ error: 'Namespace not found' });
          return;
        }
        
        res.json({ 
          language,
          namespace,
          translations 
        });
      });
    }, delay);
  });
});

// Get all translations for a specific language (grouped by namespace)
app.get('/api/translations/:language', (req, res) => {
  const { language } = req.params;
  
  getDelayForEndpoint('translations_by_namespace', (delayErr, delay) => {
    if (delayErr) {
      console.error('Error fetching delay setting:', delayErr);
      delay = 500; // Fallback to 500ms delay
    }
    
    setTimeout(() => {
      getTranslationsByNamespace(language, (err, translationsByNamespace) => {
        if (err) {
          console.error('Error fetching translations:', err);
          res.status(500).json({ error: 'Failed to fetch translations' });
          return;
        }
        
        if (Object.keys(translationsByNamespace).length === 0) {
          res.status(404).json({ error: 'Language not found' });
          return;
        }
        
        res.json({ 
          language,
          translations: translationsByNamespace 
        });
      });
    }, delay);
  });
});

// Update a specific translation
app.put('/api/translations/:language/:namespace/:key', (req, res) => {
  const { language, namespace, key } = req.params;
  const { value } = req.body;
  
  if (!value) {
    res.status(400).json({ error: 'Translation value is required' });
    return;
  }
  
  updateTranslation(language, namespace, key, value, (err, result) => {
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
      namespace,
      key,
      value,
      changes: result.changes
    });
  });
});

// Notes endpoints
app.get('/api/notes', (req, res) => {
  getDelayForEndpoint('notes', (delayErr, delay) => {
    if (delayErr) {
      console.error('Error fetching delay setting:', delayErr);
      delay = 0; // Fallback to no delay
    }
    
    setTimeout(() => {
      getAllNotes((err, notes) => {
        if (err) {
          console.error('Error fetching notes:', err);
          res.status(500).json({ error: 'Failed to fetch notes' });
          return;
        }
        res.json({ notes });
      });
    }, delay);
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

// Delay settings endpoints
app.get('/api/delay-settings', (req, res) => {
  getAllDelaySettings((err, settings) => {
    if (err) {
      console.error('Error fetching delay settings:', err);
      res.status(500).json({ error: 'Failed to fetch delay settings' });
      return;
    }
    res.json({ settings });
  });
});

app.put('/api/delay-settings/:endpoint', (req, res) => {
  const { endpoint } = req.params;
  const { delay_ms } = req.body;
  
  if (delay_ms === undefined || delay_ms < 0) {
    res.status(400).json({ error: 'Valid delay_ms value is required (>= 0)' });
    return;
  }
  
  updateDelaySettings(endpoint, parseInt(delay_ms), (err, result) => {
    if (err) {
      console.error('Error updating delay settings:', err);
      if (err.message === 'Delay setting not found') {
        res.status(404).json({ error: 'Delay setting not found' });
      } else {
        res.status(500).json({ error: 'Failed to update delay settings' });
      }
      return;
    }
    
    res.json({ 
      success: true,
      endpoint,
      delay_ms: parseInt(delay_ms),
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