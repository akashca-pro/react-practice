/**
 * TOPIC: RENDER PROPS
 * DESCRIPTION:
 * Render props is a pattern for sharing code between components
 * using a prop whose value is a function. The function receives
 * data and returns what to render.
 */

import { useState, useEffect } from 'react';

// -------------------------------------------------------------------------------------------
// 1. BASIC RENDER PROPS
// -------------------------------------------------------------------------------------------

/**
 * A component with a render prop calls a function prop to determine what to render.
 */

function MouseTracker({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return render(position);
}

// Usage
function App() {
  return (
    <MouseTracker
      render={({ x, y }) => (
        <div>Mouse position: {x}, {y}</div>
      )}
    />
  );
}

// -------------------------------------------------------------------------------------------
// 2. CHILDREN AS A FUNCTION
// -------------------------------------------------------------------------------------------

/**
 * Alternative: Use children as the render function.
 */

function MousePosition({ children }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return children(position);
}

// Usage
function App2() {
  return (
    <MousePosition>
      {({ x, y }) => <div>Position: {x}, {y}</div>}
    </MousePosition>
  );
}

// -------------------------------------------------------------------------------------------
// 3. DATA FETCHING WITH RENDER PROPS
// -------------------------------------------------------------------------------------------

function DataFetcher({ url, children }) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });

    return () => { cancelled = true; };
  }, [url]);

  return children(state);
}

// Usage
function UserProfile({ userId }) {
  return (
    <DataFetcher url={`/api/users/${userId}`}>
      {({ data, loading, error }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <p>Error: {error.message}</p>;
        return <div>{data.name}</div>;
      }}
    </DataFetcher>
  );
}

// -------------------------------------------------------------------------------------------
// 4. TOGGLE WITH RENDER PROPS
// -------------------------------------------------------------------------------------------

function Toggle({ children }) {
  const [on, setOn] = useState(false);
  const toggle = () => setOn((o) => !o);

  return children({ on, toggle, setOn });
}

// Usage
function ToggleExample() {
  return (
    <Toggle>
      {({ on, toggle }) => (
        <div>
          <button onClick={toggle}>{on ? 'ON' : 'OFF'}</button>
          {on && <div>Content is visible!</div>}
        </div>
      )}
    </Toggle>
  );
}

// -------------------------------------------------------------------------------------------
// 5. FORM STATE WITH RENDER PROPS
// -------------------------------------------------------------------------------------------

function FormState({ initialValues, children }) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
  };

  const reset = () => {
    setValues(initialValues);
    setTouched({});
    setErrors({});
  };

  return children({
    values,
    touched,
    errors,
    handleChange,
    handleBlur,
    reset,
    setErrors,
  });
}

// Usage
function LoginForm() {
  return (
    <FormState initialValues={{ email: '', password: '' }}>
      {({ values, handleChange, handleBlur, reset }) => (
        <form>
          <input
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <input
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
          />
          <button type="button" onClick={reset}>Reset</button>
        </form>
      )}
    </FormState>
  );
}

// -------------------------------------------------------------------------------------------
// 6. RENDER PROPS VS HOOKS
// -------------------------------------------------------------------------------------------

/**
 * Today, custom hooks have largely replaced render props.
 * Hooks provide the same benefits with cleaner syntax.
 */

// Render props version
function WithMouse({ render }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  // ... mouse tracking logic
  return render(pos);
}

// Hook version (preferred)
function useMouse() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);
  return pos;
}

function MouseDisplay() {
  const { x, y } = useMouse();
  return <div>Position: {x}, {y}</div>;
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Render props share logic via function props
 * 2. Function receives data, returns JSX
 * 3. Can use children as render function
 * 4. Provides flexibility for consumers
 *
 * USE CASES TODAY:
 * - Library components (Downshift, React Router)
 * - When hooks aren't suitable
 * - Highly flexible component APIs
 *
 * PREFER HOOKS WHEN:
 * - Building new components
 * - Sharing stateful logic
 * - Simpler, cleaner code needed
 */
