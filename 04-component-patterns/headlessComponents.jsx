/**
 * TOPIC: HEADLESS COMPONENTS
 * DESCRIPTION:
 * Headless components provide functionality without UI/styling.
 * They handle logic, state, and accessibility while consumers
 * control the rendering. Libraries like Headless UI use this pattern.
 */

import { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react';

// -------------------------------------------------------------------------------------------
// 1. HEADLESS TOGGLE
// -------------------------------------------------------------------------------------------

function useToggle(initialState = false) {
  const [on, setOn] = useState(initialState);

  const toggle = useCallback(() => setOn((o) => !o), []);
  const setTrue = useCallback(() => setOn(true), []);
  const setFalse = useCallback(() => setOn(false), []);

  return { on, toggle, setOn, setTrue, setFalse };
}

// Usage - consumer controls UI
function ToggleButton() {
  const { on, toggle } = useToggle(false);

  return (
    <button 
      onClick={toggle}
      style={{ background: on ? 'green' : 'gray' }}
    >
      {on ? 'ON' : 'OFF'}
    </button>
  );
}

// -------------------------------------------------------------------------------------------
// 2. HEADLESS DROPDOWN/SELECT
// -------------------------------------------------------------------------------------------

function useSelect({ items, initialSelected = null, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(initialSelected);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggleOpen = useCallback(() => setIsOpen((o) => !o), []);

  const select = useCallback((item) => {
    setSelected(item);
    onSelect?.(item);
    close();
  }, [onSelect, close]);

  // Keyboard navigation
  const onKeyDown = useCallback((e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        open();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        select(items[highlightedIndex]);
        break;
      case 'Escape':
        close();
        break;
    }
  }, [isOpen, items, highlightedIndex, select, open, close]);

  // Click outside to close
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [close]);

  return {
    isOpen,
    selected,
    highlightedIndex,
    containerRef,
    open,
    close,
    toggleOpen,
    select,
    onKeyDown,
    getItemProps: (index) => ({
      onClick: () => select(items[index]),
      onMouseEnter: () => setHighlightedIndex(index),
      'aria-selected': selected === items[index],
      'data-highlighted': highlightedIndex === index,
    }),
  };
}

// Usage with custom UI
function CustomSelect({ options }) {
  const {
    isOpen,
    selected,
    highlightedIndex,
    containerRef,
    toggleOpen,
    getItemProps,
    onKeyDown,
  } = useSelect({ items: options });

  return (
    <div ref={containerRef} className="custom-select" onKeyDown={onKeyDown}>
      <button onClick={toggleOpen} aria-haspopup="listbox">
        {selected?.label || 'Select...'}
      </button>
      {isOpen && (
        <ul role="listbox">
          {options.map((option, index) => (
            <li
              key={option.value}
              {...getItemProps(index)}
              className={highlightedIndex === index ? 'highlighted' : ''}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 3. HEADLESS DISCLOSURE/ACCORDION
// -------------------------------------------------------------------------------------------

function useDisclosure(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef(null);

  const toggle = useCallback(() => setIsOpen((o) => !o), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const getButtonProps = useCallback(() => ({
    onClick: toggle,
    'aria-expanded': isOpen,
    'aria-controls': 'disclosure-content',
  }), [toggle, isOpen]);

  const getContentProps = useCallback(() => ({
    id: 'disclosure-content',
    ref: contentRef,
    hidden: !isOpen,
  }), [isOpen]);

  return { isOpen, toggle, open, close, getButtonProps, getContentProps };
}

// Usage
function FAQ({ question, answer }) {
  const { isOpen, getButtonProps, getContentProps } = useDisclosure();

  return (
    <div className="faq-item">
      <button {...getButtonProps()} className="faq-question">
        {question}
        <span>{isOpen ? '−' : '+'}</span>
      </button>
      <div {...getContentProps()} className="faq-answer">
        {answer}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 4. HEADLESS TAB
// -------------------------------------------------------------------------------------------

function useTabs({ tabs, defaultIndex = 0 }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  const getTabProps = useCallback((index) => ({
    role: 'tab',
    'aria-selected': activeIndex === index,
    tabIndex: activeIndex === index ? 0 : -1,
    onClick: () => setActiveIndex(index),
    onKeyDown: (e) => {
      if (e.key === 'ArrowRight') {
        setActiveIndex((i) => (i + 1) % tabs.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((i) => (i - 1 + tabs.length) % tabs.length);
      }
    },
  }), [activeIndex, tabs.length]);

  const getPanelProps = useCallback((index) => ({
    role: 'tabpanel',
    hidden: activeIndex !== index,
    tabIndex: 0,
  }), [activeIndex]);

  return { activeIndex, setActiveIndex, getTabProps, getPanelProps };
}

// -------------------------------------------------------------------------------------------
// 5. HEADLESS MODAL
// -------------------------------------------------------------------------------------------

function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const previousFocus = useRef(null);

  const open = useCallback(() => {
    previousFocus.current = document.activeElement;
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    previousFocus.current?.focus();
  }, []);

  // Trap focus inside modal
  const getModalProps = useCallback(() => ({
    role: 'dialog',
    'aria-modal': true,
    onKeyDown: (e) => {
      if (e.key === 'Escape') close();
    },
  }), [close]);

  return { isOpen, open, close, getModalProps };
}

// -------------------------------------------------------------------------------------------
// 6. BENEFITS OF HEADLESS COMPONENTS
// -------------------------------------------------------------------------------------------

/**
 * BENEFITS:
 * 1. Full styling control
 * 2. Reusable logic across designs
 * 3. Built-in accessibility
 * 4. Smaller bundle (no CSS)
 * 5. Works with any styling solution
 *
 * LIBRARIES USING THIS PATTERN:
 * - Headless UI (Tailwind Labs)
 * - Radix UI Primitives
 * - Downshift
 * - React Aria (Adobe)
 * - Ariakit
 */

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Separate logic from presentation
 * 2. Return props getters for accessibility
 * 3. Handle keyboard navigation
 * 4. Manage focus appropriately
 *
 * BEST PRACTICES:
 * - Include all ARIA attributes
 * - Handle keyboard interactions
 * - Return stable callbacks (useCallback)
 * - Provide getXxxProps functions
 * - Document the hook API clearly
 */
