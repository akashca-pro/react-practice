/**
 * TOPIC: useState HOOK
 * DESCRIPTION:
 * useState is the most fundamental React hook for managing state in
 * functional components. It allows components to have reactive data
 * that triggers re-renders when updated.
 */

import { useState } from 'react';

// -------------------------------------------------------------------------------------------
// 1. BASIC USAGE
// -------------------------------------------------------------------------------------------

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 2. DIFFERENT DATA TYPES
// -------------------------------------------------------------------------------------------

function StateTypes() {
  const [text, setText] = useState('hello');           // String
  const [number, setNumber] = useState(42);             // Number
  const [isOpen, setIsOpen] = useState(false);          // Boolean
  const [items, setItems] = useState([1, 2, 3]);        // Array
  const [user, setUser] = useState({ name: 'Akash' });  // Object
  const [value, setValue] = useState(null);             // Null/Undefined
}

// -------------------------------------------------------------------------------------------
// 3. FUNCTIONAL UPDATES
// -------------------------------------------------------------------------------------------

/**
 * Use functional updates when new state depends on previous state.
 */

function FunctionalUpdates() {
  const [count, setCount] = useState(0);

  // Without functional update - may be stale
  const incrementBad = () => setCount(count + 1);

  // With functional update - always uses latest value
  const incrementGood = () => setCount((prev) => prev + 1);

  // Multiple updates work correctly
  const incrementThree = () => {
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
  };

  // Toggle pattern
  const [isOn, setIsOn] = useState(false);
  const toggle = () => setIsOn((prev) => !prev);

  return <button onClick={incrementThree}>{count}</button>;
}

// -------------------------------------------------------------------------------------------
// 4. LAZY INITIALIZATION
// -------------------------------------------------------------------------------------------

/**
 * Pass a function for expensive initial state calculations.
 */

function LazyInit() {
  // Function only runs on first render
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem('myValue');
    return saved ? JSON.parse(saved) : { items: [] };
  });

  return <div>{value.items.length}</div>;
}

// -------------------------------------------------------------------------------------------
// 5. UPDATING ARRAYS
// -------------------------------------------------------------------------------------------

function ArrayState() {
  const [items, setItems] = useState(['a', 'b', 'c']);

  // Add item
  const add = (item) => setItems([...items, item]);
  const addStart = (item) => setItems([item, ...items]);
  const addAtIndex = (item, idx) => setItems([...items.slice(0, idx), item, ...items.slice(idx)]);

  // Remove item
  const remove = (idx) => setItems(items.filter((_, i) => i !== idx));
  const removeByValue = (val) => setItems(items.filter((item) => item !== val));

  // Update item
  const update = (idx, val) => setItems(items.map((item, i) => (i === idx ? val : item)));

  // Replace all
  const replaceAll = (newItems) => setItems(newItems);

  return <ul>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>;
}

// -------------------------------------------------------------------------------------------
// 6. UPDATING OBJECTS
// -------------------------------------------------------------------------------------------

function ObjectState() {
  const [user, setUser] = useState({
    name: 'Akash',
    email: 'akash@example.com',
    preferences: { theme: 'dark', lang: 'en' },
  });

  // Update flat property
  const updateName = (name) => setUser({ ...user, name });

  // Update nested property
  const updateTheme = (theme) =>
    setUser({ ...user, preferences: { ...user.preferences, theme } });

  // Remove property
  const removeEmail = () => {
    const { email, ...rest } = user;
    setUser(rest);
  };

  return <p>{user.name}</p>;
}

// -------------------------------------------------------------------------------------------
// 7. MULTIPLE STATE VARIABLES VS OBJECT
// -------------------------------------------------------------------------------------------

// Separate variables (preferred for unrelated state)
function SeparateState() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);
}

// Single object (useful for related state)
function ObjectFormState() {
  const [form, setForm] = useState({ name: '', email: '', age: 0 });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return <input name="name" value={form.name} onChange={handleChange} />;
}

// -------------------------------------------------------------------------------------------
// 8. COMMON PATTERNS
// -------------------------------------------------------------------------------------------

// Toggle pattern
function Toggle() {
  const [isOn, setIsOn] = useState(false);
  return <button onClick={() => setIsOn((p) => !p)}>{isOn ? 'ON' : 'OFF'}</button>;
}

// Previous value pattern
function PreviousValue() {
  const [count, setCount] = useState(0);
  const [prevCount, setPrevCount] = useState(0);

  const increment = () => {
    setPrevCount(count);
    setCount((c) => c + 1);
  };

  return <p>Current: {count}, Previous: {prevCount}</p>;
}

// Reset pattern
function Resettable({ initialValue = 0 }) {
  const [value, setValue] = useState(initialValue);
  const reset = () => setValue(initialValue);

  return (
    <div>
      <p>{value}</p>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. useState returns [value, setter]
 * 2. Setter triggers re-render with new value
 * 3. Use functional updates when depending on previous state
 * 4. Use lazy initialization for expensive initial values
 * 5. Always update state immutably
 *
 * BEST PRACTICES:
 * - Use multiple useState for unrelated state
 * - Use object state for related values (like form fields)
 * - Always use functional updates in loops/closures
 * - Never mutate state directly
 * - Consider useReducer for complex state logic
 */
