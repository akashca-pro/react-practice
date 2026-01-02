/**
 * TOPIC: ENVIRONMENT SETUP AND PROJECT STRUCTURE
 * DESCRIPTION:
 * Best practices for setting up React projects, including folder structure,
 * configuration, build tools, and development workflow.
 */

// -------------------------------------------------------------------------------------------
// 1. PROJECT INITIALIZATION
// -------------------------------------------------------------------------------------------

/**
 * VITE (Recommended for new projects)
 *
 * npm create vite@latest my-app -- --template react
 * npm create vite@latest my-app -- --template react-ts  // TypeScript
 *
 * CREATE REACT APP (Legacy)
 *
 * npx create-react-app my-app
 * npx create-react-app my-app --template typescript
 *
 * NEXT.JS (Full-stack)
 *
 * npx create-next-app@latest my-app
 */

// -------------------------------------------------------------------------------------------
// 2. RECOMMENDED FOLDER STRUCTURE
// -------------------------------------------------------------------------------------------

/**
 * Feature-based structure (recommended for larger apps)
 *
 * src/
 * ├── components/          # Shared/reusable components
 * │   ├── ui/              # UI primitives (Button, Input, Modal)
 * │   ├── forms/           # Form components
 * │   └── layout/          # Layout components (Header, Footer, Sidebar)
 * │
 * ├── features/            # Feature modules
 * │   ├── auth/
 * │   │   ├── components/  # Feature-specific components
 * │   │   ├── hooks/       # Feature-specific hooks
 * │   │   ├── services/    # API calls
 * │   │   ├── store/       # State management
 * │   │   └── index.js     # Public exports
 * │   │
 * │   └── products/
 * │       ├── components/
 * │       ├── hooks/
 * │       └── services/
 * │
 * ├── hooks/               # Global custom hooks
 * ├── services/            # Global API services
 * ├── store/               # Global state (Redux, Zustand)
 * ├── utils/               # Utility functions
 * ├── types/               # TypeScript types (if using TS)
 * ├── styles/              # Global styles
 * ├── assets/              # Images, fonts, etc.
 * ├── constants/           # App constants
 * ├── config/              # Configuration files
 * └── App.jsx
 */

// -------------------------------------------------------------------------------------------
// 3. COMPONENT FILE STRUCTURE
// -------------------------------------------------------------------------------------------

/**
 * Option A: Single file per component
 *
 * components/
 * ├── Button.jsx
 * ├── Button.module.css
 * └── Button.test.jsx
 *
 * Option B: Folder per component (recommended for complex components)
 *
 * components/
 * └── Button/
 *     ├── index.jsx         # Main component
 *     ├── Button.module.css # Styles
 *     ├── Button.test.jsx   # Tests
 *     ├── Button.stories.jsx # Storybook
 *     └── types.ts          # TypeScript types
 */

// -------------------------------------------------------------------------------------------
// 4. IMPORT ALIASES
// -------------------------------------------------------------------------------------------

/**
 * Configure path aliases to avoid relative import hell.
 *
 * vite.config.js:
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
});

/**
 * tsconfig.json (for TypeScript):
 *
 * {
 *   "compilerOptions": {
 *     "baseUrl": ".",
 *     "paths": {
 *       "@/*": ["src/*"],
 *       "@components/*": ["src/components/*"]
 *     }
 *   }
 * }
 */

// Usage
import { Button } from '@components/ui';
import { useAuth } from '@hooks/useAuth';

// -------------------------------------------------------------------------------------------
// 5. ENVIRONMENT VARIABLES
// -------------------------------------------------------------------------------------------

/**
 * .env files:
 * - .env                 # Default
 * - .env.local           # Local overrides (git ignored)
 * - .env.development     # Development mode
 * - .env.production      # Production mode
 *
 * VITE: Variables must start with VITE_
 * CRA: Variables must start with REACT_APP_
 */

// .env
// VITE_API_URL=https://api.example.com
// VITE_APP_NAME=MyApp

// Access in code
const apiUrl = import.meta.env.VITE_API_URL;
const appName = import.meta.env.VITE_APP_NAME;

// Type definitions (env.d.ts)
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
}

// -------------------------------------------------------------------------------------------
// 6. ESSENTIAL DEPENDENCIES
// -------------------------------------------------------------------------------------------

/**
 * ROUTING
 * npm install react-router-dom
 *
 * STATE MANAGEMENT
 * npm install zustand
 * npm install @reduxjs/toolkit react-redux
 *
 * DATA FETCHING
 * npm install @tanstack/react-query axios
 *
 * FORMS
 * npm install react-hook-form zod @hookform/resolvers
 *
 * STYLING
 * npm install -D tailwindcss postcss autoprefixer
 * npm install clsx tailwind-merge
 *
 * UI COMPONENTS
 * npx shadcn-ui@latest init
 *
 * TESTING
 * npm install -D vitest @testing-library/react @testing-library/jest-dom
 *
 * LINTING
 * npm install -D eslint eslint-plugin-react eslint-plugin-react-hooks
 */

// -------------------------------------------------------------------------------------------
// 7. ESLINT CONFIGURATION
// -------------------------------------------------------------------------------------------

/**
 * .eslintrc.cjs
 */

module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: 'detect' } },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': 'warn',
    'react/prop-types': 'off',
  },
};

// -------------------------------------------------------------------------------------------
// 8. BARREL EXPORTS
// -------------------------------------------------------------------------------------------

/**
 * Use index.js files to create clean public APIs.
 */

// components/ui/index.js
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';
export { Card } from './Card';

// Usage - clean imports
import { Button, Input, Modal } from '@components/ui';

// -------------------------------------------------------------------------------------------
// 9. RECOMMENDED SCRIPTS
// -------------------------------------------------------------------------------------------

/**
 * package.json scripts:
 *
 * "scripts": {
 *   "dev": "vite",
 *   "build": "vite build",
 *   "preview": "vite preview",
 *   "lint": "eslint src --ext js,jsx --report-unused-disable-directives",
 *   "lint:fix": "eslint src --ext js,jsx --fix",
 *   "test": "vitest",
 *   "test:coverage": "vitest run --coverage",
 *   "format": "prettier --write src/**/*.{js,jsx,css}"
 * }
 */

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * PROJECT SETUP CHECKLIST:
 * 1. ✓ Choose build tool (Vite recommended)
 * 2. ✓ Configure path aliases
 * 3. ✓ Set up environment variables
 * 4. ✓ Configure ESLint + Prettier
 * 5. ✓ Establish folder structure
 * 6. ✓ Install core dependencies
 *
 * BEST PRACTICES:
 * - Feature-based folder structure for large apps
 * - Use path aliases for clean imports
 * - Barrel exports for public APIs
 * - Keep .env files for different environments
 * - Configure linting early
 * - Set up testing infrastructure early
 */
