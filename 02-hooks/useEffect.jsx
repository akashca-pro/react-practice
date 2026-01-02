/**
 * TOPIC: useEffect HOOK
 * DESCRIPTION:
 * useEffect handles side effects in React components: data fetching,
 * subscriptions, DOM manipulation, and timers. It runs after render
 * and can optionally clean up before the next effect or unmount.
 */

import { useState, useEffect } from 'react';

// -------------------------------------------------------------------------------------------
// 1. BASIC USAGE
// -------------------------------------------------------------------------------------------

function BasicEffect() {
  const [count, setCount] = useState(0);

  // Runs after every render
  useEffect(() => {
    document.title = `Count: ${count}`;
  });

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// -------------------------------------------------------------------------------------------
// 2. DEPENDENCY ARRAY
// -------------------------------------------------------------------------------------------

function DependencyArray() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  // Runs after EVERY render (usually not what you want)
  useEffect(() => {
    console.log('Runs every render');
  });

  // Runs ONLY on mount (empty array)
  useEffect(() => {
    console.log('Runs once on mount');
  }, []);

  // Runs when count changes
  useEffect(() => {
    console.log('Count changed:', count);
  }, [count]);

  // Runs when count OR name changes
  useEffect(() => {
    console.log('Count or name changed');
  }, [count, name]);

  return <div>{count}</div>;
}

// -------------------------------------------------------------------------------------------
// 3. CLEANUP FUNCTION
// -------------------------------------------------------------------------------------------

/**
 * Return a cleanup function to run before the next effect or unmount.
 * Essential for subscriptions, timers, and event listeners.
 */

function TimerComponent() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    // Cleanup: runs on unmount or before next effect
    return () => clearInterval(interval);
  }, []);

  return <p>Seconds: {seconds}</p>;
}

function EventListenerComponent() {
  useEffect(() => {
    const handleResize = () => console.log(window.innerWidth);
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div>Resize the window</div>;
}

// -------------------------------------------------------------------------------------------
// 4. DATA FETCHING
// -------------------------------------------------------------------------------------------

function DataFetching({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();

        if (!isCancelled) {
          setUser(data);
          setLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchUser();

    // Cleanup: prevent state updates on unmounted component
    return () => {
      isCancelled = true;
    };
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <p>{user?.name}</p>;
}

// Using AbortController
function FetchWithAbort({ url }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then((res) => res.json())
      .then(setData)
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err);
      });

    return () => controller.abort();
  }, [url]);

  return <div>{JSON.stringify(data)}</div>;
}

// -------------------------------------------------------------------------------------------
// 5. COMMON PATTERNS
// -------------------------------------------------------------------------------------------

// Sync state to localStorage
function LocalStorageSync() {
  const [value, setValue] = useState(() => {
    return localStorage.getItem('myKey') || '';
  });

  useEffect(() => {
    localStorage.setItem('myKey', value);
  }, [value]);

  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}

// Debounced effect
function DebouncedSearch({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${query}`)
        .then((res) => res.json())
        .then(setResults);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return <ul>{results.map((r) => <li key={r.id}>{r.name}</li>)}</ul>;
}

// Document title
function Title({ title }) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    return () => { document.title = prevTitle; };
  }, [title]);

  return null;
}

// -------------------------------------------------------------------------------------------
// 6. EFFECT ORDER
// -------------------------------------------------------------------------------------------

/**
 * Effect execution order:
 * 1. Component renders
 * 2. React updates DOM
 * 3. Browser paints screen
 * 4. useEffect runs
 *
 * Cleanup order:
 * 1. New render occurs
 * 2. React calculates what changed
 * 3. Cleanup from previous effect runs
 * 4. New effect runs
 */

function EffectOrder() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('Effect runs:', count);
    return () => console.log('Cleanup runs:', count);
  }, [count]);

  // Click: Cleanup 0 -> Effect 1 -> Cleanup 1 -> Effect 2...
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// -------------------------------------------------------------------------------------------
// 7. COMMON MISTAKES
// -------------------------------------------------------------------------------------------

// Missing dependency
function MissingDep() {
  const [count, setCount] = useState(0);

  // BAD: count should be in dependencies
  useEffect(() => {
    const interval = setInterval(() => {
      console.log(count); // Always logs 0!
    }, 1000);
    return () => clearInterval(interval);
  }, []); // Missing: count

  // GOOD: Use functional update or include dependency
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => c + 1); // Uses latest value
    }, 1000);
    return () => clearInterval(interval);
  }, []);
}

// Infinite loop
function InfiniteLoop() {
  const [data, setData] = useState({});

  // BAD: Creates new object every render
  useEffect(() => {
    setData({ value: 1 }); // Triggers re-render!
  }, [data]); // data changes every render

  // GOOD: Use specific values or refs
  useEffect(() => {
    setData({ value: 1 });
  }, []); // Run once
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. useEffect runs after render
 * 2. Dependency array controls when effect runs
 * 3. Return cleanup function for subscriptions/timers
 * 4. Include all dependencies used inside effect
 *
 * BEST PRACTICES:
 * - Always specify dependencies honestly
 * - Use cleanup for subscriptions, timers, abort controllers
 * - Handle race conditions in async effects
 * - Consider custom hooks for reusable effects
 * - Use useLayoutEffect for synchronous DOM measurements
 * - Consider React Query/SWR for data fetching
 */
