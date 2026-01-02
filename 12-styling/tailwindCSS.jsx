/**
 * TOPIC: TAILWIND CSS
 * DESCRIPTION:
 * Tailwind CSS is a utility-first CSS framework for rapidly building
 * custom designs directly in your markup using utility classes.
 * npm install -D tailwindcss postcss autoprefixer
 */

// -------------------------------------------------------------------------------------------
// 1. BASIC USAGE
// -------------------------------------------------------------------------------------------

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
      <div className="text-gray-600">{children}</div>
    </div>
  );
}

function Button({ children, variant = 'primary', size = 'md', ...props }) {
  const baseClasses = 'font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
      {...props}
    >
      {children}
    </button>
  );
}

// -------------------------------------------------------------------------------------------
// 2. RESPONSIVE DESIGN
// -------------------------------------------------------------------------------------------

/**
 * Breakpoints:
 * sm: 640px
 * md: 768px
 * lg: 1024px
 * xl: 1280px
 * 2xl: 1536px
 */

function ResponsiveLayout() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      <div className="hidden md:block">Sidebar (hidden on mobile)</div>
      <div className="col-span-1 md:col-span-2 lg:col-span-3">Main Content</div>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 3. STATE VARIANTS
// -------------------------------------------------------------------------------------------

function InteractiveElement() {
  return (
    <button className="
      bg-blue-500 text-white px-4 py-2 rounded
      hover:bg-blue-600
      focus:ring-2 focus:ring-blue-300 focus:outline-none
      active:bg-blue-700
      disabled:bg-gray-400 disabled:cursor-not-allowed
      group
    ">
      <span className="group-hover:text-yellow-300">Hover me</span>
    </button>
  );
}

// -------------------------------------------------------------------------------------------
// 4. DARK MODE
// -------------------------------------------------------------------------------------------

function DarkModeCard() {
  return (
    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 rounded-lg">
      <h2 className="text-xl font-bold">Dark Mode Support</h2>
      <p className="text-gray-600 dark:text-gray-400">
        Automatically adapts to user preference
      </p>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 5. CLSX/CLASSNAMES FOR CONDITIONAL CLASSES
// -------------------------------------------------------------------------------------------

import clsx from 'clsx';

function ConditionalButton({ disabled, loading, variant }) {
  return (
    <button
      className={clsx(
        'px-4 py-2 rounded font-semibold transition',
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-gray-200 text-gray-800 hover:bg-gray-300': variant === 'secondary',
          'opacity-50 cursor-not-allowed': disabled,
          'animate-pulse': loading,
        }
      )}
      disabled={disabled}
    >
      {loading ? 'Loading...' : 'Click me'}
    </button>
  );
}

// -------------------------------------------------------------------------------------------
// 6. CUSTOM COMPONENTS WITH CVA
// -------------------------------------------------------------------------------------------

/**
 * cva (class-variance-authority) for type-safe variants
 * npm install class-variance-authority
 */

import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        ghost: 'bg-transparent hover:bg-gray-100',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

type ButtonProps = VariantProps<typeof buttonVariants> & {
  children: React.ReactNode;
};

function Button({ variant, size, children }: ButtonProps) {
  return (
    <button className={buttonVariants({ variant, size })}>
      {children}
    </button>
  );
}

// -------------------------------------------------------------------------------------------
// 7. TAILWIND CONFIG
// -------------------------------------------------------------------------------------------

/**
 * tailwind.config.js
 * 
 * module.exports = {
 *   content: ['./src/** /*.{js,jsx,ts,tsx}'],
 *   darkMode: 'class', // or 'media'
 *   theme: {
 *     extend: {
 *       colors: {
 *         primary: '#3B82F6',
 *         secondary: '#10B981',
 *       },
 *       fontFamily: {
 *         sans: ['Inter', 'sans-serif'],
 *       },
 *       spacing: {
 *         '128': '32rem',
 *       },
 *     },
 *   },
 *   plugins: [],
 * };
 */

// -------------------------------------------------------------------------------------------
// 8. COMMON PATTERNS
// -------------------------------------------------------------------------------------------

// Flexbox centering
<div className="flex items-center justify-center h-screen">
  Centered content
</div>

// Grid layout
<div className="grid grid-cols-12 gap-4">
  <div className="col-span-3">Sidebar</div>
  <div className="col-span-9">Main</div>
</div>

// Typography
<h1 className="text-4xl font-bold tracking-tight">Heading</h1>
<p className="text-lg text-gray-600 leading-relaxed">Paragraph text</p>

// Form input
<input className="
  w-full px-4 py-2 rounded-lg border border-gray-300
  focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
  placeholder-gray-400
" />

// Card with gradient
<div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-xl text-white">
  Gradient card
</div>

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY FEATURES:
 * 1. Utility-first approach
 * 2. Responsive with breakpoint prefixes
 * 3. State variants (hover, focus, etc.)
 * 4. Dark mode support
 * 5. Highly customizable
 *
 * BEST PRACTICES:
 * - Extract repeated patterns into components
 * - Use @apply sparingly in CSS
 * - Use clsx/classnames for conditionals
 * - Use cva for variant components
 * - Configure content paths properly
 * - Use IDE extensions for autocomplete
 *
 * TOOLS:
 * - Tailwind CSS IntelliSense (VS Code)
 * - clsx / classnames
 * - class-variance-authority (cva)
 * - tailwind-merge
 */
