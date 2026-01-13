/**
 * TOPIC: forwardRef
 * DESCRIPTION:
 * forwardRef lets a component expose a DOM node to a parent component
 * using a ref. It's essential for building reusable component libraries
 * that need to expose control over underlying DOM elements.
 */

import { forwardRef, useRef, useImperativeHandle } from 'react';

// -------------------------------------------------------------------------------------------
// 1. BASIC USAGE
// -------------------------------------------------------------------------------------------

/**
 * Without forwardRef, refs don't work on custom components.
 * forwardRef lets you pass ref through to a DOM element.
 */

// This won't work - ref doesn't forward
function BrokenInput(props) {
  return <input {...props} />;
}

// This works - ref forwards to the input
const ForwardedInput = forwardRef(function ForwardedInput(props, ref) {
  return <input ref={ref} {...props} />;
});

// Usage
function Form() {
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current.focus();
  };

  return (
    <div>
      <ForwardedInput ref={inputRef} placeholder="Enter text" />
      <button onClick={focusInput}>Focus</button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 2. WITH DISPLAY NAME
// -------------------------------------------------------------------------------------------

/**
 * Named function expression for better DevTools display.
 */

const Button = forwardRef(function Button({ children, variant, ...props }, ref) {
  return (
    <button ref={ref} className={`btn btn-${variant}`} {...props}>
      {children}
    </button>
  );
});

// Or set displayName separately
const Input = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});
Input.displayName = 'Input';

// -------------------------------------------------------------------------------------------
// 3. FORWARDING TO MULTIPLE ELEMENTS
// -------------------------------------------------------------------------------------------

const FormField = forwardRef(function FormField({ label, error, ...props }, ref) {
  return (
    <div className="form-field">
      <label>{label}</label>
      <input ref={ref} {...props} />
      {error && <span className="error">{error}</span>}
    </div>
  );
});

// -------------------------------------------------------------------------------------------
// 4. WITH TypeScript
// -------------------------------------------------------------------------------------------

/**
 * WITH TypeScript (in .tsx files):
 *
 * interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
 *   label?: string;
 * }
 *
 * const TypedInput = forwardRef<HTMLInputElement, InputProps>(
 *   function TypedInput({ label, ...props }, ref) {
 *     return (
 *       <div>
 *         {label && <label>{label}</label>}
 *         <input ref={ref} {...props} />
 *       </div>
 *     );
 *   }
 * );
 */

// JSX equivalent (without TypeScript):
const TypedInput = forwardRef(function TypedInput({ label, ...props }, ref) {
  return (
    <div>
      {label && <label>{label}</label>}
      <input ref={ref} {...props} />
    </div>
  );
});

// -------------------------------------------------------------------------------------------
// 5. COMBINING WITH useImperativeHandle
// -------------------------------------------------------------------------------------------

/**
 * Use useImperativeHandle to expose custom methods instead of DOM node.
 */

const CustomInput = forwardRef(function CustomInput(props, ref) {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    blur: () => inputRef.current.blur(),
    clear: () => { inputRef.current.value = ''; },
    getValue: () => inputRef.current.value,
  }));

  return <input ref={inputRef} {...props} />;
});

// Parent can call custom methods
function Parent() {
  const inputRef = useRef(null);

  return (
    <div>
      <CustomInput ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>Focus</button>
      <button onClick={() => inputRef.current.clear()}>Clear</button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 6. HIGHER-ORDER COMPONENT WITH forwardRef
// -------------------------------------------------------------------------------------------

function withLogging(Component) {
  const WithLogging = forwardRef(function WithLogging(props, ref) {
    console.log('Rendering with props:', props);
    return <Component ref={ref} {...props} />;
  });

  WithLogging.displayName = `WithLogging(${Component.displayName || Component.name})`;
  return WithLogging;
}

const LoggedInput = withLogging(ForwardedInput);

// -------------------------------------------------------------------------------------------
// 7. COMPONENT LIBRARY PATTERNS
// -------------------------------------------------------------------------------------------

// Base component with forwarded ref
const BaseButton = forwardRef(function BaseButton(
  { children, className, ...props },
  ref
) {
  return (
    <button ref={ref} className={`base-btn ${className}`} {...props}>
      {children}
    </button>
  );
});

// Variant components that also forward refs
const PrimaryButton = forwardRef(function PrimaryButton(props, ref) {
  return <BaseButton ref={ref} className="primary" {...props} />;
});

const SecondaryButton = forwardRef(function SecondaryButton(props, ref) {
  return <BaseButton ref={ref} className="secondary" {...props} />;
});

// -------------------------------------------------------------------------------------------
// 8. COMMON PATTERNS
// -------------------------------------------------------------------------------------------

// Text area with auto-resize
const AutoResizeTextarea = forwardRef(function AutoResizeTextarea(props, ref) {
  const textareaRef = useRef(null);

  // Combine forwarded ref with internal ref
  useImperativeHandle(ref, () => textareaRef.current);

  const handleInput = (e) => {
    const textarea = textareaRef.current;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    props.onInput?.(e);
  };

  return (
    <textarea
      ref={textareaRef}
      {...props}
      onInput={handleInput}
    />
  );
});

// Dialog with focus trap
const Dialog = forwardRef(function Dialog({ open, onClose, children }, ref) {
  const dialogRef = useRef(null);

  useImperativeHandle(ref, () => ({
    close: () => onClose(),
    getElement: () => dialogRef.current,
  }));

  if (!open) return null;

  return (
    <div ref={dialogRef} className="dialog" role="dialog">
      {children}
    </div>
  );
});

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. forwardRef passes ref to child components
 * 2. Essential for component libraries
 * 3. Use with useImperativeHandle for custom methods
 * 4. Set displayName for debugging
 *
 * USE CASES:
 * - Reusable UI components
 * - Form inputs
 * - Focus management
 * - Component libraries
 * - HOCs that preserve refs
 *
 * BEST PRACTICES:
 * - Always name your forwardRef components
 * - Use displayName for anonymous functions
 * - Combine with useImperativeHandle when needed
 * - Forward to the most useful element
 */
