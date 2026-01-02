/**
 * TOPIC: ACCESSIBILITY IN REACT
 * DESCRIPTION:
 * Building accessible React applications ensures everyone can use your app,
 * including people using assistive technologies. This covers ARIA, focus
 * management, keyboard navigation, and screen reader support.
 */

import { useRef, useEffect, useId, useState } from 'react';

// -------------------------------------------------------------------------------------------
// 1. SEMANTIC HTML
// -------------------------------------------------------------------------------------------

/**
 * Use semantic HTML elements for better accessibility.
 */

// ❌ Bad - no semantic meaning
function BadNavigation() {
  return (
    <div className="nav">
      <div onClick={goHome}>Home</div>
      <div onClick={goAbout}>About</div>
    </div>
  );
}

// ✅ Good - semantic elements
function GoodNavigation() {
  return (
    <nav aria-label="Main navigation">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  );
}

// ❌ Bad - div as button
function BadButton({ onClick, children }) {
  return <div onClick={onClick}>{children}</div>;
}

// ✅ Good - actual button
function GoodButton({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
}

// -------------------------------------------------------------------------------------------
// 2. ARIA ATTRIBUTES
// -------------------------------------------------------------------------------------------

function AccessibleModal({ isOpen, onClose, title, children }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      hidden={!isOpen}
    >
      <h2 id="modal-title">{title}</h2>
      <div id="modal-description">{children}</div>
      <button onClick={onClose} aria-label="Close modal">×</button>
    </div>
  );
}

function LoadingButton({ isLoading, children }) {
  return (
    <button
      aria-busy={isLoading}
      aria-disabled={isLoading}
      disabled={isLoading}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}

function ExpandableSection({ title, children }) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  return (
    <div>
      <button
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded(!expanded)}
      >
        {title}
      </button>
      <div id={contentId} hidden={!expanded}>
        {children}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 3. FOCUS MANAGEMENT
// -------------------------------------------------------------------------------------------

function FocusableModal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Save current focus
      previousActiveElement.current = document.activeElement;
      // Move focus to modal
      modalRef.current?.focus();
    } else {
      // Restore focus when closed
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      role="dialog"
      tabIndex={-1}
      aria-modal="true"
    >
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  );
}

// Focus trap - keep focus within modal
function FocusTrap({ children }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, []);

  return <div ref={containerRef}>{children}</div>;
}

// -------------------------------------------------------------------------------------------
// 4. KEYBOARD NAVIGATION
// -------------------------------------------------------------------------------------------

function AccessibleTabs({ tabs }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = (e, index) => {
    let newIndex = index;

    switch (e.key) {
      case 'ArrowRight':
        newIndex = (index + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        newIndex = (index - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    setActiveIndex(newIndex);
  };

  return (
    <div>
      <div role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeIndex === index}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeIndex === index ? 0 : -1}
            onClick={() => setActiveIndex(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeIndex !== index}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 5. FORM ACCESSIBILITY
// -------------------------------------------------------------------------------------------

function AccessibleForm() {
  const [errors, setErrors] = useState({});
  const nameId = useId();
  const emailId = useId();

  return (
    <form aria-label="Contact form">
      <div>
        <label htmlFor={nameId}>Name *</label>
        <input
          id={nameId}
          name="name"
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? `${nameId}-error` : undefined}
        />
        {errors.name && (
          <span id={`${nameId}-error`} role="alert">
            {errors.name}
          </span>
        )}
      </div>

      <div>
        <label htmlFor={emailId}>Email *</label>
        <input
          id={emailId}
          name="email"
          type="email"
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={`${emailId}-hint ${errors.email ? `${emailId}-error` : ''}`}
        />
        <span id={`${emailId}-hint`} className="hint">
          We'll never share your email
        </span>
        {errors.email && (
          <span id={`${emailId}-error`} role="alert">
            {errors.email}
          </span>
        )}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 6. LIVE REGIONS
// -------------------------------------------------------------------------------------------

function LiveAnnouncements() {
  const [message, setMessage] = useState('');

  const announce = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 1000);
  };

  return (
    <div>
      {/* Polite: Waits for user to finish current task */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {message}
      </div>

      {/* Assertive: Interrupts immediately */}
      <div aria-live="assertive" className="sr-only">
        {/* For urgent notifications */}
      </div>

      <button onClick={() => announce('Item added to cart')}>
        Add to Cart
      </button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 7. SKIP LINKS
// -------------------------------------------------------------------------------------------

function SkipLinks() {
  return (
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
  );
}

function Layout({ children }) {
  return (
    <>
      <SkipLinks />
      <header>Navigation</header>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    </>
  );
}

// -------------------------------------------------------------------------------------------
// 8. SCREEN READER ONLY TEXT
// -------------------------------------------------------------------------------------------

// CSS: .sr-only { position: absolute; width: 1px; height: 1px; ... }

function IconButton({ icon, label, onClick }) {
  return (
    <button onClick={onClick} aria-label={label}>
      {icon}
    </button>
  );
}

function SearchResults({ count }) {
  return (
    <div>
      <span aria-live="polite" className="sr-only">
        {count} results found
      </span>
      {/* Visual results */}
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY AREAS:
 * 1. Semantic HTML - Use proper elements
 * 2. ARIA - Add meaning when needed
 * 3. Focus - Manage keyboard focus
 * 4. Forms - Label and describe inputs
 * 5. Live regions - Announce changes
 *
 * BEST PRACTICES:
 * - Use semantic HTML first
 * - Add ARIA only when necessary
 * - Test with keyboard only
 * - Test with screen readers
 * - Use focus management in modals
 * - Provide skip links
 *
 * TOOLS:
 * - axe DevTools
 * - Lighthouse accessibility audit
 * - NVDA / VoiceOver for testing
 * - eslint-plugin-jsx-a11y
 */
