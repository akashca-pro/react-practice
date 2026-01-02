/**
 * TOPIC: PORTALS
 * DESCRIPTION:
 * Portals render children into a DOM node outside the parent hierarchy.
 * Useful for modals, tooltips, dropdowns that need to break out of
 * overflow: hidden or z-index stacking contexts.
 */

import { createPortal } from 'react-dom';
import { useState, useEffect, useRef } from 'react';

// -------------------------------------------------------------------------------------------
// 1. BASIC PORTAL
// -------------------------------------------------------------------------------------------

function Portal({ children }) {
  return createPortal(
    children,
    document.getElementById('portal-root')
  );
}

// Usage
function App() {
  return (
    <div>
      <h1>App Content</h1>
      <Portal>
        <div className="modal">I render outside the parent!</div>
      </Portal>
    </div>
  );
}

// HTML: <div id="root"></div><div id="portal-root"></div>

// -------------------------------------------------------------------------------------------
// 2. MODAL WITH PORTAL
// -------------------------------------------------------------------------------------------

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        {children}
      </div>
    </div>,
    document.body
  );
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>Open Modal</button>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Modal Title</h2>
        <p>Modal content here</p>
      </Modal>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 3. DYNAMIC PORTAL CONTAINER
// -------------------------------------------------------------------------------------------

function DynamicPortal({ children }) {
  const [container] = useState(() => document.createElement('div'));

  useEffect(() => {
    document.body.appendChild(container);
    return () => document.body.removeChild(container);
  }, [container]);

  return createPortal(children, container);
}

// -------------------------------------------------------------------------------------------
// 4. TOOLTIP WITH PORTAL
// -------------------------------------------------------------------------------------------

function Tooltip({ children, content }) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const targetRef = useRef(null);

  const showTooltip = () => {
    const rect = targetRef.current.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setIsVisible(true);
  };

  const hideTooltip = () => setIsVisible(false);

  return (
    <>
      <span
        ref={targetRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {children}
      </span>
      {isVisible && createPortal(
        <div
          className="tooltip"
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
}

// -------------------------------------------------------------------------------------------
// 5. DROPDOWN WITH PORTAL
// -------------------------------------------------------------------------------------------

function Dropdown({ trigger, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !triggerRef.current?.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && createPortal(
        <div
          className="dropdown-menu"
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
          }}
        >
          {children}
        </div>,
        document.body
      )}
    </>
  );
}

// -------------------------------------------------------------------------------------------
// 6. EVENT BUBBLING
// -------------------------------------------------------------------------------------------

/**
 * Events bubble through React tree, not DOM tree!
 * Parent can catch events from portal children.
 */

function Parent() {
  const handleClick = (e) => {
    console.log('Caught in parent!');
  };

  return (
    <div onClick={handleClick}>
      <Portal>
        <button>Click me</button> {/* Event bubbles to Parent */}
      </Portal>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 7. ACCESSIBILITY WITH PORTALS
// -------------------------------------------------------------------------------------------

function AccessibleModal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      modalRef.current?.focus();
    } else {
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="modal-content"
        tabIndex={-1}
      >
        <h2 id="modal-title">{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>,
    document.body
  );
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * USE CASES:
 * 1. Modals/Dialogs
 * 2. Tooltips
 * 3. Dropdowns
 * 4. Notifications/Toasts
 * 5. Floating elements
 *
 * KEY POINTS:
 * 1. Renders outside parent DOM
 * 2. Events still bubble through React tree
 * 3. Context still works across portals
 * 4. CSS inheritance is broken
 *
 * BEST PRACTICES:
 * - Clean up portal container on unmount
 * - Handle accessibility (focus, escape)
 * - Position relative to viewport or trigger
 * - Prevent body scroll when modal is open
 */
