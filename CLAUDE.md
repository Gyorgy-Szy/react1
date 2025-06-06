# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start frontend development server with hot module replacement
- `npm run server` - Start backend API server with nodemon (auto-restart)
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

**For development, run both commands in separate terminals:**
1. `npm run server` (starts API server on port 3001)
2. `npm run dev` (starts frontend on port 5173 with API proxy)

## Architecture

This is a full-stack React application with a Node.js/Express backend and SQLite database for translations.

### Frontend Stack
- **React 19** with TypeScript and StrictMode
- **Vite** for bundling and development with HMR
- **React Router** for client-side routing (`/` and `/config`)
- **i18next** with custom backend loader for dynamic translation loading
- **React Suspense** for loading states during translation fetching

### Backend Stack
- **Express.js** API server with CORS enabled
- **SQLite** database for storing translations
- **Nodemon** for development auto-restart

### Translation System
- **Dynamic Loading**: Translations load from SQLite via API calls
- **Language Detection**: Auto-detects browser language with localStorage persistence
- **Editable**: Users can edit translations through the config page UI
- **Custom Backend**: `src/i18n-backend.ts` implements custom i18next backend

### Key Architecture Patterns
- **API Proxy**: Vite proxies `/api/*` requests to Express server on port 3001
- **Shared Header**: `components/Header.tsx` provides navigation and language switching
- **Loading States**: Uses React Suspense + manual loading states for UX
- **Database Layer**: `server/database.js` handles SQLite operations with callbacks

### API Endpoints
- `GET /api/languages` - Get available language codes
- `GET /api/translations/:language` - Get all translations for a language (with 2s delay)
- `PUT /api/translations/:language/:key` - Update a specific translation

### Component Structure
- `src/components/Header.tsx` - Global navigation with language dropdown and settings
- `src/components/LoadingSpinner.tsx` - Reusable loading component
- `src/pages/Config.tsx` - Configuration page with translation editor
- `src/App.tsx` - Main application page