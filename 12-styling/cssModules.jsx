/**
 * TOPIC: CSS MODULES
 * DESCRIPTION:
 * CSS Modules scope CSS locally by default, preventing class name collisions.
 * Each class gets a unique generated name at build time.
 */

import styles from './Button.module.css';
import cn from 'classnames'; // or clsx

// -------------------------------------------------------------------------------------------
// 1. BASIC USAGE
// -------------------------------------------------------------------------------------------

/**
 * CSS Module file: Button.module.css
 * 
 * .button {
 *   padding: 8px 16px;
 *   border: none;
 *   border-radius: 4px;
 *   cursor: pointer;
 * }
 * 
 * .primary {
 *   background: blue;
 *   color: white;
 * }
 * 
 * .secondary {
 *   background: gray;
 *   color: black;
 * }
 */

function Button({ children, variant = 'primary' }) {
  return (
    <button className={`${styles.button} ${styles[variant]}`}>
      {children}
    </button>
  );
}

// -------------------------------------------------------------------------------------------
// 2. COMPOSING CLASSES
// -------------------------------------------------------------------------------------------

/**
 * Card.module.css:
 * 
 * .card {
 *   padding: 16px;
 *   border-radius: 8px;
 *   box-shadow: 0 2px 8px rgba(0,0,0,0.1);
 * }
 * 
 * .elevated {
 *   box-shadow: 0 8px 24px rgba(0,0,0,0.2);
 * }
 * 
 * .interactive {
 *   cursor: pointer;
 *   transition: transform 0.2s;
 * }
 * 
 * .interactive:hover {
 *   transform: translateY(-2px);
 * }
 */

// Using template literals
function Card({ elevated, interactive, children }) {
  const className = `
    ${styles.card}
    ${elevated ? styles.elevated : ''}
    ${interactive ? styles.interactive : ''}
  `.trim();

  return <div className={className}>{children}</div>;
}

// Using classnames/clsx library
function CardWithClassnames({ elevated, interactive, children }) {
  return (
    <div
      className={cn(styles.card, {
        [styles.elevated]: elevated,
        [styles.interactive]: interactive,
      })}
    >
      {children}
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 3. COMPOSITION (composes)
// -------------------------------------------------------------------------------------------

/**
 * Use 'composes' to inherit from other classes:
 * 
 * base.module.css:
 * .font-base {
 *   font-family: 'Inter', sans-serif;
 *   font-size: 16px;
 * }
 * 
 * Typography.module.css:
 * .heading {
 *   composes: font-base from './base.module.css';
 *   font-weight: bold;
 *   font-size: 24px;
 * }
 */

// -------------------------------------------------------------------------------------------
// 4. GLOBAL STYLES
// -------------------------------------------------------------------------------------------

/**
 * Use :global to escape scoping:
 * 
 * .container :global(.external-library-class) {
 *   color: red;
 * }
 * 
 * :global {
 *   .unscoped-class {
 *     color: blue;
 *   }
 * }
 */

// -------------------------------------------------------------------------------------------
// 5. WITH TYPESCRIPT
// -------------------------------------------------------------------------------------------

/**
 * Create type declarations for CSS modules.
 * 
 * File: Button.module.css.d.ts
 * 
 * declare const styles: {
 *   button: string;
 *   primary: string;
 *   secondary: string;
 * };
 * export default styles;
 * 
 * Or use generic declaration (css.d.ts):
 * 
 * declare module '*.module.css' {
 *   const classes: { [key: string]: string };
 *   export default classes;
 * }
 */

// -------------------------------------------------------------------------------------------
// 6. CSS VARIABLES WITH MODULES
// -------------------------------------------------------------------------------------------

/**
 * theme.module.css:
 * 
 * .light {
 *   --bg-primary: white;
 *   --text-primary: black;
 * }
 * 
 * .dark {
 *   --bg-primary: #1a1a1a;
 *   --text-primary: white;
 * }
 * 
 * Component.module.css:
 * 
 * .container {
 *   background: var(--bg-primary);
 *   color: var(--text-primary);
 * }
 */

function ThemeProvider({ theme, children }) {
  return (
    <div className={styles[theme]}>
      {children}
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 7. RESPONSIVE STYLES
// -------------------------------------------------------------------------------------------

/**
 * Responsive.module.css:
 * 
 * .container {
 *   padding: 16px;
 * }
 * 
 * @media (min-width: 768px) {
 *   .container {
 *     padding: 24px;
 *   }
 * }
 * 
 * @media (min-width: 1024px) {
 *   .container {
 *     padding: 32px;
 *     max-width: 1200px;
 *     margin: 0 auto;
 *   }
 * }
 */

// -------------------------------------------------------------------------------------------
// 8. SETUP
// -------------------------------------------------------------------------------------------

/**
 * VITE: Works out of the box
 * 
 * CREATE REACT APP: Works out of the box
 * 
 * WEBPACK: Add css-loader with modules option
 * 
 * {
 *   test: /\.module\.css$/,
 *   use: [
 *     'style-loader',
 *     {
 *       loader: 'css-loader',
 *       options: {
 *         modules: {
 *           localIdentName: '[name]__[local]--[hash:base64:5]',
 *         },
 *       },
 *     },
 *   ],
 * }
 */

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY FEATURES:
 * 1. Locally scoped by default
 * 2. Generated unique class names
 * 3. Composable with 'composes'
 * 4. Works with CSS variables
 *
 * BEST PRACTICES:
 * - Use camelCase for class names
 * - Use classnames/clsx for conditional classes
 * - Create type declarations for TypeScript
 * - Use :global sparingly
 * - Organize by component
 *
 * NAMING:
 * - ComponentName.module.css
 * - styles.containerWrapper (camelCase)
 */

export { Button, Card };
