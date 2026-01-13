/**
 * TOPIC: useCallback HOOK
 * DESCRIPTION:
 * useCallback memoizes functions, returning the same function reference
 * between renders. This prevents unnecessary re-renders of child components
 * that depend on function props.
 */

import { useCallback, useState, memo, useEffect, useMemo } from 'react';

// Helper function for debounce example
function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Placeholder for expensive calculation example
function expensiveCalculation() {
  return 42;
}

// -------------------------------------------------------------------------------------------
// 1. BASIC USAGE
// -------------------------------------------------------------------------------------------

function ParentComponent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  // Without useCallback: new function every render
  // const handleClick = () => console.log('clicked');

  // With useCallback: same function reference
  const handleClick = useCallback(() => {
    console.log('Button clicked');
  }, []);

  // Dependencies: include values used inside
  const handleIncrement = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <MemoizedButton onClick={handleClick} />
    </div>
  );
}

// Placeholder components for examples
const MemoizedList = memo(function MemoizedList({ items, onItemClick }) {
  return <ul>{items.map(item => <li key={item.id} onClick={() => onItemClick(item.id)}>{item.name}</li>)}</ul>;
});

const MemoizedItem = memo(function MemoizedItem({ item, onDelete }) {
  return <li>{item.name} <button onClick={() => onDelete(item.id)}>Delete</button></li>;
});

// -------------------------------------------------------------------------------------------
// 2. WITH React.memo
// -------------------------------------------------------------------------------------------

/**
 * useCallback is most useful with React.memo child components.
 */

const MemoizedButton = memo(function Button({ onClick }) {
  console.log('Button rendered');
  return <button onClick={onClick}>Click me</button>;
});

function Parent() {
  const [count, setCount] = useState(0);

  // Without useCallback: Button re-renders on every Parent render
  // const handleClick = () => console.log('click');

  // With useCallback: Button only re-renders when handleClick changes
  const handleClick = useCallback(() => {
    console.log('click');
  }, []);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <MemoizedButton onClick={handleClick} />
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 3. WITH DEPENDENCIES
// -------------------------------------------------------------------------------------------

function SearchComponent({ items }) {
  const [query, setQuery] = useState('');

  // Function updates when items or query changes
  const handleSearch = useCallback(() => {
    const filtered = items.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    console.log('Results:', filtered);
  }, [items, query]);

  // Functional updates don't need dependencies
  const increment = useCallback(() => {
    setCount((prev) => prev + 1); // prev is always current
  }, []);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 4. AS EFFECT DEPENDENCY
// -------------------------------------------------------------------------------------------

function FetchComponent({ userId }) {
  const [data, setData] = useState(null);

  // Stable function reference
  const fetchUser = useCallback(async () => {
    const response = await fetch(`/api/users/${userId}`);
    const json = await response.json();
    setData(json);
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]); // Safe to use as dependency

  return <div>{data?.name}</div>;
}

// -------------------------------------------------------------------------------------------
// 5. WHEN TO USE useCallback
// -------------------------------------------------------------------------------------------

/**
 * USE useCallback when:
 * - Passing callbacks to memoized child components
 * - Function is used in useEffect dependencies
 * - Function is passed to custom hooks
 *
 * DON'T USE useCallback when:
 * - Component doesn't re-render often
 * - Child components aren't memoized
 * - Premature optimization
 */

function WhenToUse({ items }) {
  // GOOD: Passed to memoized component
  const handleItemClick = useCallback((id) => {
    console.log('Item clicked:', id);
  }, []);

  // GOOD: Used in effect dependency
  const loadData = useCallback(async () => {
    // fetch data
  }, []);

  // UNNECESSARY: Simple component, not memoized
  // const handleClick = useCallback(() => {}, []);

  return <MemoizedList items={items} onItemClick={handleItemClick} />;
}

// -------------------------------------------------------------------------------------------
// 6. COMMON PATTERNS
// -------------------------------------------------------------------------------------------

// Event handlers with arguments
function ItemList({ items, onDelete }) {
  const handleDelete = useCallback((id) => {
    onDelete(id);
  }, [onDelete]);

  return (
    <ul>
      {items.map((item) => (
        <MemoizedItem
          key={item.id}
          item={item}
          onDelete={handleDelete}
        />
      ))}
    </ul>
  );
}

// Debounced callback
function DebouncedInput({ onChange }) {
  const [value, setValue] = useState('');

  const debouncedChange = useCallback(
    debounce((val) => {
      onChange(val);
    }, 300),
    [onChange]
  );

  const handleChange = useCallback((e) => {
    setValue(e.target.value);
    debouncedChange(e.target.value);
  }, [debouncedChange]);

  return <input value={value} onChange={handleChange} />;
}

// -------------------------------------------------------------------------------------------
// 7. useCallback VS useMemo
// -------------------------------------------------------------------------------------------

/**
 * useCallback(fn, deps) is equivalent to useMemo(() => fn, deps)
 */

function Comparison() {
  // useCallback returns the FUNCTION
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);

  // useMemo returns the RESULT of the function
  const memoizedValue = useMemo(() => {
    return expensiveCalculation();
  }, []);

  // Creating a function with useMemo (equivalent to useCallback)
  const sameThing = useMemo(() => {
    return () => console.log('Clicked');
  }, []);
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. useCallback memoizes functions
 * 2. Returns same reference if dependencies unchanged
 * 3. Most useful with React.memo child components
 * 4. Prevents unnecessary re-renders
 *
 * BEST PRACTICES:
 * - Use with React.memo for performance gains
 * - Include all dependencies used inside function
 * - Use functional updates to avoid state dependencies
 * - Don't overuse - adds complexity
 * - Profile first, optimize where needed
 *
 * COMMON MISTAKES:
 * - Using without React.memo (no benefit)
 * - Missing dependencies
 * - Overusing for every function
 */
