# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

## Architecture

This is a React 19 + TypeScript + Vite project using ES modules. The build system uses:

- **Vite** for bundling and development server with HMR
- **TypeScript** with project references (tsconfig.app.json for app code, tsconfig.node.json for build tools)
- **ESLint** with TypeScript-ESLint, React Hooks, and React Refresh plugins
- **React 19** with StrictMode enabled

### Project Structure

- `src/main.tsx` - Application entry point that renders the root App component
- `src/App.tsx` - Main application component
- `public/` - Static assets served directly
- Build output goes to `dist/` (ignored by ESLint)

### Key Configuration

- Uses `@vitejs/plugin-react` for React support (Babel-based Fast Refresh)
- ESLint configured for browser globals and React development patterns
- TypeScript configured with project references for better build performance