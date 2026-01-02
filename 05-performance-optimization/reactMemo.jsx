/**
 * TOPIC: React.memo
 * DESCRIPTION:
 * React.memo is a higher-order component that memoizes a component,
 * preventing re-renders when props haven't changed. Use it to optimize
 * performance for components that render often with the same props.
 */

import { memo, useState, useCallback, useMemo } from 'react';

// -------------------------------------------------------------------------------------------
// 1. BASIC USAGE
// -------------------------------------------------------------------------------------------

/**
 * Without memo: Child re-renders whenever Parent re-renders
 * With memo: Child only re-renders when its props change
 */

const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  console.log('ExpensiveComponent rendered');
  // Expensive rendering logic...
  return <div>{data.name}</div>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const data = useMemo(() => ({ name: 'Akash' }), []);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <ExpensiveComponent data={data} />
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 2. CUSTOM COMPARISON FUNCTION
// -------------------------------------------------------------------------------------------

/**
 * By default, memo does shallow comparison of props.
 * Provide a custom arePropsEqual function for deep comparison.
 */

const DeepMemoComponent = memo(
  function DeepMemoComponent({ user }) {
    return <div>{user.profile.name}</div>;
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (don't re-render)
    return prevProps.user.id === nextProps.user.id &&
           prevProps.user.profile.name === nextProps.user.profile.name;
  }
);

// -------------------------------------------------------------------------------------------
// 3. COMMON PITFALLS
// -------------------------------------------------------------------------------------------

// PITFALL 1: New object/array reference every render
function BadParent() {
  const [count, setCount] = useState(0);

  // Creates new object every render - memo won't help!
  const style = { color: 'blue' };
  const items = [1, 2, 3];

  return <MemoizedChild style={style} items={items} />;
}

// SOLUTION: Use useMemo for objects/arrays
function GoodParent() {
  const [count, setCount] = useState(0);

  const style = useMemo(() => ({ color: 'blue' }), []);
  const items = useMemo(() => [1, 2, 3], []);

  return <MemoizedChild style={style} items={items} />;
}

// PITFALL 2: New function reference every render
function BadCallback() {
  const [count, setCount] = useState(0);

  // New function every render!
  const handleClick = () => console.log('clicked');

  return <MemoizedButton onClick={handleClick} />;
}

// SOLUTION: Use useCallback
function GoodCallback() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => console.log('clicked'), []);

  return <MemoizedButton onClick={handleClick} />;
}

// -------------------------------------------------------------------------------------------
// 4. WHEN TO USE React.memo
// -------------------------------------------------------------------------------------------

/**
 * USE memo WHEN:
 * - Component renders often with same props
 * - Component has expensive rendering
 * - Component is pure (same props = same output)
 * - Parent re-renders frequently but child props don't change
 *
 * DON'T USE memo WHEN:
 * - Props change on every render anyway
 * - Component is simple/cheap to render
 * - Not sure if needed (measure first!)
 */

// Good candidate: Heavy list item
const MemoizedListItem = memo(function ListItem({ item, onSelect }) {
  // Complex rendering...
  return (
    <li onClick={() => onSelect(item.id)}>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </li>
  );
});

// -------------------------------------------------------------------------------------------
// 5. React.memo WITH forwardRef
// -------------------------------------------------------------------------------------------

import { forwardRef } from 'react';

const MemoizedInput = memo(forwardRef(function Input(props, ref) {
  return <input ref={ref} {...props} />;
}));

// -------------------------------------------------------------------------------------------
// 6. DISPLAY NAME
// -------------------------------------------------------------------------------------------

// For debugging in DevTools
const MemoizedComponent = memo(function MyComponent(props) {
  return <div>{props.text}</div>;
});

MemoizedComponent.displayName = 'MemoizedComponent';

// -------------------------------------------------------------------------------------------
// 7. MEASURING BENEFITS
// -------------------------------------------------------------------------------------------

/**
 * Always measure before and after with:
 * - React DevTools Profiler
 * - console.time/timeEnd
 * - Performance API
 */

const TrackedComponent = memo(function TrackedComponent({ data }) {
  console.log('TrackedComponent render');
  return <div>{data}</div>;
});

// In React DevTools:
// 1. Open Profiler tab
// 2. Record interactions
// 3. Check "Why did this render?" highlights

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. memo prevents re-renders when props unchanged
 * 2. Uses shallow comparison by default
 * 3. Custom comparison function for deep comparison
 * 4. Combine with useMemo/useCallback for objects/functions
 *
 * BEST PRACTICES:
 * - Profile before optimizing
 * - Keep props stable (useMemo, useCallback)
 * - Don't wrap everything in memo
 * - Add displayName for debugging
 * - Measure the actual benefit
 */
