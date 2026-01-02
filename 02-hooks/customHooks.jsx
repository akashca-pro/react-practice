/**
 * TOPIC: CUSTOM HOOKS
 * DESCRIPTION:
 * Custom hooks let you extract component logic into reusable functions.
 * They follow the "use" naming convention and can call other hooks.
 * Custom hooks are the primary way to share stateful logic in React.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// -------------------------------------------------------------------------------------------
// 1. BASIC CUSTOM HOOK
// -------------------------------------------------------------------------------------------

/**
 * Custom hooks must start with "use" to follow React conventions.
 */

function useCounter(initialValue = 0, step = 1) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => setCount((c) => c + step), [step]);
  const decrement = useCallback(() => setCount((c) => c - step), [step]);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);

  return { count, increment, decrement, reset };
}

// Usage
function CounterComponent() {
  const { count, increment, decrement, reset } = useCounter(0, 1);
  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 2. COMMON CUSTOM HOOKS
// -------------------------------------------------------------------------------------------

// useToggle - Boolean toggle state
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  return { value, toggle, setTrue, setFalse };
}

// useLocalStorage - Persist state to localStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// useDebounce - Debounce a value
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// usePrevious - Get previous value
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

// -------------------------------------------------------------------------------------------
// 3. DATA FETCHING HOOKS
// -------------------------------------------------------------------------------------------

function useFetch(url) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setState({ data: null, loading: true, error: null });

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ data: null, loading: false, error: error.message });
        }
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [url]);

  return state;
}

// Usage
function UserProfile({ userId }) {
  const { data, loading, error } = useFetch(`/api/users/${userId}`);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <p>{data.name}</p>;
}

// -------------------------------------------------------------------------------------------
// 4. DOM AND BROWSER HOOKS
// -------------------------------------------------------------------------------------------

// useWindowSize - Track window dimensions
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// useClickOutside - Detect clicks outside element
function useClickOutside(ref, callback) {
  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, callback]);
}

// useMediaQuery - CSS media query hook
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = (e) => setMatches(e.matches);

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// -------------------------------------------------------------------------------------------
// 5. FORM HOOKS
// -------------------------------------------------------------------------------------------

function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return { values, errors, touched, handleChange, handleBlur, reset, setErrors };
}

// Usage
function LoginForm() {
  const { values, handleChange, handleBlur, reset } = useForm({
    email: '',
    password: '',
  });

  return (
    <form>
      <input name="email" value={values.email} onChange={handleChange} onBlur={handleBlur} />
      <input name="password" type="password" value={values.password} onChange={handleChange} />
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 6. COMPOSING HOOKS
// -------------------------------------------------------------------------------------------

/**
 * Custom hooks can use other custom hooks.
 */

function useSearch(items, searchKey) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const results = useMemo(() => {
    if (!debouncedQuery) return items;
    return items.filter((item) =>
      item[searchKey].toLowerCase().includes(debouncedQuery.toLowerCase())
    );
  }, [items, debouncedQuery, searchKey]);

  return { query, setQuery, results };
}

// -------------------------------------------------------------------------------------------
// 7. RULES FOR CUSTOM HOOKS
// -------------------------------------------------------------------------------------------

/**
 * RULES:
 * 1. Name must start with "use"
 * 2. Can call other hooks
 * 3. Follow rules of hooks (top level, React functions only)
 * 4. Each call gets its own isolated state
 *
 * BEST PRACTICES:
 * - Keep hooks focused on one concern
 * - Return stable references (useCallback, useMemo)
 * - Handle cleanup properly
 * - Document parameters and return values
 */

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Custom hooks extract reusable stateful logic
 * 2. Must start with "use" prefix
 * 3. Can compose multiple hooks
 * 4. Each instance has isolated state
 *
 * COMMON PATTERNS:
 * - useToggle, useCounter (simple state)
 * - useLocalStorage, useSessionStorage (persistence)
 * - useFetch, useAsync (data fetching)
 * - useDebounce, useThrottle (timing)
 * - useForm (form handling)
 * - useWindowSize, useMediaQuery (browser APIs)
 *
 * BEST PRACTICES:
 * - Return stable references with useCallback/useMemo
 * - Clean up subscriptions and timers
 * - Handle edge cases (SSR, errors)
 * - Keep hooks small and focused
 */
