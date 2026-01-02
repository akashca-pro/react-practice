/**
 * TOPIC: STRICT MODE
 * DESCRIPTION:
 * StrictMode is a development tool that helps find common bugs early.
 * It activates additional checks and warnings for its descendants.
 * Has no effect in production builds.
 */

import { StrictMode } from 'react';

// -------------------------------------------------------------------------------------------
// 1. BASIC USAGE
// -------------------------------------------------------------------------------------------

/**
 * Wrap your app (or parts of it) in StrictMode.
 */

// main.jsx / index.jsx
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Or wrap specific parts
function App() {
  return (
    <div>
      <Header />
      <StrictMode>
        <main>
          <SuspectComponent />
        </main>
      </StrictMode>
      <Footer />
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 2. WHAT STRICT MODE DOES
// -------------------------------------------------------------------------------------------

/**
 * StrictMode helps find:
 * 
 * 1. IMPURE RENDERS
 *    - Renders components twice to detect side effects
 *    - Functions should return same result for same inputs
 * 
 * 2. MISSING EFFECT CLEANUP
 *    - Runs effects twice (mount -> unmount -> mount)
 *    - Catches missing cleanup functions
 * 
 * 3. DEPRECATED APIS
 *    - Warns about legacy lifecycle methods
 *    - Warns about legacy string refs
 *    - Warns about findDOMNode
 */

// -------------------------------------------------------------------------------------------
// 3. DOUBLE RENDERING
// -------------------------------------------------------------------------------------------

/**
 * Components render twice in development to catch impure renders.
 * 
 * Pure component (safe):
 */
function PureComponent({ items }) {
  // Same input -> Same output ✓
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return <div>Total: ${total}</div>;
}

/**
 * Impure component (problematic):
 */
let externalCounter = 0;

function ImpureComponent() {
  externalCounter++; // Side effect! Will be called twice
  console.log('Rendered', externalCounter, 'times');
  return <div>Count: {externalCounter}</div>;
}

// Fix: Move to state or ref
function FixedComponent() {
  const countRef = useRef(0);
  countRef.current++;
  return <div>Count: {countRef.current}</div>;
}

// -------------------------------------------------------------------------------------------
// 4. DOUBLE EFFECT EXECUTION
// -------------------------------------------------------------------------------------------

/**
 * Effects run twice: setup -> cleanup -> setup
 * This catches missing cleanup functions.
 */

// Problem: No cleanup
function BrokenSubscription() {
  useEffect(() => {
    const subscription = api.subscribe(handleData);
    // Missing cleanup! Memory leak in StrictMode
  }, []);
}

// Fixed: Proper cleanup
function FixedSubscription() {
  useEffect(() => {
    const subscription = api.subscribe(handleData);
    return () => subscription.unsubscribe(); // Cleanup ✓
  }, []);
}

// Problem: Stale fetch data
function BrokenFetch() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData); // May set state after unmount
  }, []);
}

// Fixed: Cancel stale requests
function FixedFetch() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        if (!cancelled) setData(data);
      });

    return () => { cancelled = true; };
  }, []);
}

// -------------------------------------------------------------------------------------------
// 5. COMMON ISSUES CAUGHT
// -------------------------------------------------------------------------------------------

// Issue 1: Modifying arrays/objects during render
function BadArrayRender({ items }) {
  items.sort(); // Mutates prop! Double render shows inconsistent results
  return <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>;
}

function GoodArrayRender({ items }) {
  const sorted = [...items].sort(); // Create copy first
  return <ul>{sorted.map(i => <li key={i}>{i}</li>)}</ul>;
}

// Issue 2: Random values in render
function BadRandomRender() {
  const id = Math.random(); // Different each render!
  return <div id={id}>Content</div>;
}

function GoodRandomRender() {
  const [id] = useState(() => Math.random()); // Stable
  // Or use useId() hook
  return <div id={id}>Content</div>;
}

// Issue 3: Timer without cleanup
function BadTimer() {
  useEffect(() => {
    const id = setInterval(() => console.log('tick'), 1000);
    // No cleanup - timer runs forever!
  }, []);
}

function GoodTimer() {
  useEffect(() => {
    const id = setInterval(() => console.log('tick'), 1000);
    return () => clearInterval(id);
  }, []);
}

// -------------------------------------------------------------------------------------------
// 6. LEGACY API WARNINGS
// -------------------------------------------------------------------------------------------

/**
 * StrictMode warns about deprecated patterns:
 * 
 * ❌ String refs: ref="myRef"
 * ❌ findDOMNode
 * ❌ Legacy context API
 * ❌ componentWillMount, componentWillUpdate, componentWillReceiveProps
 */

// -------------------------------------------------------------------------------------------
// 7. PRODUCTION BEHAVIOR
// -------------------------------------------------------------------------------------------

/**
 * StrictMode has NO runtime cost in production:
 * - No double rendering
 * - No double effects
 * - No warnings
 * - Essentially a no-op
 */

// -------------------------------------------------------------------------------------------
// 8. REACT 18+ STRICT MODE
// -------------------------------------------------------------------------------------------

/**
 * React 18 added new checks:
 * - Simulates mounting, unmounting, and remounting
 * - Tests for component reusability (future features)
 * - Prepares for offscreen rendering
 */

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * STRICT MODE CATCHES:
 * 1. Impure render functions
 * 2. Missing effect cleanup
 * 3. Deprecated APIs
 * 4. Accidental side effects
 *
 * BEST PRACTICES:
 * - Always use StrictMode in development
 * - Wrap entire app at entry point
 * - Fix all warnings before production
 * - Write pure render functions
 * - Always clean up effects
 *
 * REMEMBER:
 * - Double render is intentional
 * - Only in development mode
 * - No performance impact in production
 * - Can be applied to subtrees
 */
