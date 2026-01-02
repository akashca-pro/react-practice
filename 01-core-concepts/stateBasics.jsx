/**
 * TOPIC: STATE BASICS
 * DESCRIPTION:
 * State is data that changes over time in your React application.
 * Unlike props, state is managed within a component and can be updated.
 * When state changes, React re-renders the component.
 */

import { useState, useMemo, useRef } from 'react';

// -------------------------------------------------------------------------------------------
// 1. useState HOOK BASICS
// -------------------------------------------------------------------------------------------

/**
 * useState returns [currentValue, setterFunction].
 */

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// Multiple state variables
function UserForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);

  return (
    <form>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} />
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 2. UPDATING STATE CORRECTLY
// -------------------------------------------------------------------------------------------

/**
 * Always use setter function - never mutate state directly.
 */

// Updating arrays immutably
function TodoList() {
  const [todos, setTodos] = useState(['Learn React']);

  const addTodo = (newTodo) => setTodos([...todos, newTodo]);
  const removeTodo = (index) => setTodos(todos.filter((_, i) => i !== index));
  const updateTodo = (index, text) => setTodos(todos.map((t, i) => i === index ? text : t));

  return <ul>{todos.map((todo, i) => <li key={i}>{todo}</li>)}</ul>;
}

// Updating objects immutably
function UserProfile() {
  const [user, setUser] = useState({
    name: 'Akash',
    address: { city: 'Mumbai', country: 'India' },
  });

  const updateName = (newName) => setUser({ ...user, name: newName });
  const updateCity = (city) => setUser({ ...user, address: { ...user.address, city } });

  return <p>{user.name} - {user.address.city}</p>;
}

// -------------------------------------------------------------------------------------------
// 3. FUNCTIONAL UPDATES
// -------------------------------------------------------------------------------------------

/**
 * When new state depends on previous state, use the functional form.
 */

function CounterWithFunctionalUpdates() {
  const [count, setCount] = useState(0);

  // Each update uses latest value
  const incrementThree = () => {
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
  };

  const toggle = () => setCount((prev) => !prev);

  return <button onClick={incrementThree}>{count}</button>;
}

// -------------------------------------------------------------------------------------------
// 4. LAZY INITIALIZATION
// -------------------------------------------------------------------------------------------

/**
 * Pass a function when initial state requires expensive computation.
 */

function PersistentCounter() {
  // Only runs on initial render
  const [count, setCount] = useState(() => {
    const saved = localStorage.getItem('count');
    return saved ? JSON.parse(saved) : 0;
  });

  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// -------------------------------------------------------------------------------------------
// 5. DERIVED STATE
// -------------------------------------------------------------------------------------------

/**
 * Don't store computed values in state - calculate during render.
 */

function ShoppingCart({ items }) {
  // Derived values - no state needed
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isEmpty = items.length === 0;

  // Use useMemo for expensive calculations
  const expensiveValue = useMemo(() => {
    return items.filter(item => item.price > 100).length;
  }, [items]);

  return <p>Items: {itemCount}, Total: ${totalPrice}</p>;
}

// -------------------------------------------------------------------------------------------
// 6. COMMON STATE PATTERNS
// -------------------------------------------------------------------------------------------

// Boolean toggle
function Modal() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open</button>
      {isOpen && <div className="modal"><button onClick={() => setIsOpen(false)}>Close</button></div>}
    </>
  );
}

// Form with object
function Form() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  return <input name="name" value={formData.name} onChange={handleChange} />;
}

// Loading/Error/Data pattern
function DataFetching() {
  const [state, setState] = useState({ data: null, loading: false, error: null });

  const fetchData = async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error.message });
    }
  };

  return state.loading ? <p>Loading...</p> : <button onClick={fetchData}>Load</button>;
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. useState returns [value, setter]
 * 2. State updates trigger re-renders
 * 3. Never mutate state directly
 * 4. Use functional updates when new state depends on previous
 * 5. Use lazy initialization for expensive computations
 *
 * BEST PRACTICES:
 * - Keep state minimal - don't store derived values
 * - Update objects/arrays immutably (spread, map, filter)
 * - Use functional updates for state based on previous value
 * - Lift state up when multiple components need it
 * - Consider useReducer for complex state logic
 */
