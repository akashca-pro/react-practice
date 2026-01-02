/**
 * TOPIC: useLayoutEffect HOOK
 * DESCRIPTION:
 * useLayoutEffect fires synchronously after DOM mutations but before
 * the browser paints. Use it for DOM measurements and synchronous
 * visual updates to prevent flickering.
 */

import { useLayoutEffect, useEffect, useState, useRef } from 'react';

// -------------------------------------------------------------------------------------------
// 1. useLayoutEffect VS useEffect
// -------------------------------------------------------------------------------------------

/**
 * EXECUTION ORDER:
 * 1. React renders component
 * 2. React updates DOM
 * 3. useLayoutEffect runs (BLOCKING)
 * 4. Browser paints screen
 * 5. useEffect runs (NON-BLOCKING)
 */

function EffectOrder() {
  useLayoutEffect(() => {
    console.log('1. useLayoutEffect - DOM ready, before paint');
  });

  useEffect(() => {
    console.log('2. useEffect - after paint');
  });

  console.log('0. Render');

  return <div>Check console</div>;
}

// -------------------------------------------------------------------------------------------
// 2. DOM MEASUREMENTS
// -------------------------------------------------------------------------------------------

/**
 * Use useLayoutEffect when you need to measure DOM elements
 * and use those measurements to update state/styles.
 */

function MeasuredComponent() {
  const ref = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (ref.current) {
      const { width, height } = ref.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, []);

  return (
    <div ref={ref}>
      <p>Width: {dimensions.width}px, Height: {dimensions.height}px</p>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 3. PREVENTING VISUAL FLICKER
// -------------------------------------------------------------------------------------------

// BAD: Causes flicker (shows initial position, then moves)
function FlickerProblem() {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    // Runs after paint - user sees 0, then 100
    setPosition(100);
  }, []);

  return <div style={{ transform: `translateX(${position}px)` }}>Box</div>;
}

// GOOD: No flicker (updates before paint)
function NoFlicker() {
  const [position, setPosition] = useState(0);

  useLayoutEffect(() => {
    // Runs before paint - user only sees 100
    setPosition(100);
  }, []);

  return <div style={{ transform: `translateX(${position}px)` }}>Box</div>;
}

// -------------------------------------------------------------------------------------------
// 4. SCROLL RESTORATION
// -------------------------------------------------------------------------------------------

function ChatMessages({ messages, lastReadId }) {
  const containerRef = useRef(null);
  const lastReadRef = useRef(null);

  useLayoutEffect(() => {
    // Scroll to last read message before paint
    if (lastReadRef.current) {
      lastReadRef.current.scrollIntoView();
    }
  }, [lastReadId]);

  return (
    <div ref={containerRef} style={{ height: 400, overflow: 'auto' }}>
      {messages.map((msg) => (
        <div key={msg.id} ref={msg.id === lastReadId ? lastReadRef : null}>
          {msg.text}
        </div>
      ))}
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 5. TOOLTIP POSITIONING
// -------------------------------------------------------------------------------------------

function Tooltip({ targetRef, children }) {
  const tooltipRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (targetRef.current && tooltipRef.current) {
      const targetRect = targetRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      setPosition({
        top: targetRect.bottom + 8,
        left: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
      });
    }
  }, [targetRef]);

  return (
    <div
      ref={tooltipRef}
      style={{ position: 'fixed', top: position.top, left: position.left }}
    >
      {children}
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 6. WHEN TO USE EACH
// -------------------------------------------------------------------------------------------

/**
 * USE useLayoutEffect:
 * - DOM measurements needed before paint
 * - Synchronous visual updates
 * - Scroll position restoration
 * - Tooltip/popover positioning
 * - Animation setup
 *
 * USE useEffect (default):
 * - Data fetching
 * - Subscriptions
 * - Logging
 * - Anything that doesn't need to block painting
 */

function WhenToUse() {
  // useEffect: Non-visual side effects
  useEffect(() => {
    document.title = 'Page Title';
    fetch('/api/data');
    analytics.track('page_view');
  });

  // useLayoutEffect: Visual DOM operations
  useLayoutEffect(() => {
    const { height } = element.getBoundingClientRect();
    // Update based on measurement
  });
}

// -------------------------------------------------------------------------------------------
// 7. SSR CONSIDERATIONS
// -------------------------------------------------------------------------------------------

/**
 * useLayoutEffect shows a warning during SSR because it can't
 * run on the server. Use conditional check or useEffect for SSR.
 */

function SSRSafe() {
  // Option 1: Check for window
  const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    // Safe for SSR
  }, []);
}

// Custom hook for SSR-safe layout effects
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. useLayoutEffect runs synchronously after DOM updates
 * 2. Blocks browser painting until complete
 * 3. Use for DOM measurements and synchronous updates
 * 4. Prevents visual flickering
 *
 * BEST PRACTICES:
 * - Default to useEffect
 * - Only use useLayoutEffect for visual DOM operations
 * - Keep operations fast (blocks painting)
 * - Use useIsomorphicLayoutEffect for SSR
 *
 * WHEN TO USE:
 * - DOM measurements before paint
 * - Scroll restoration
 * - Third-party DOM library integration
 * - Preventing layout shift
 */
