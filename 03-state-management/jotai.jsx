/**
 * TOPIC: JOTAI
 * DESCRIPTION:
 * Jotai is a primitive and flexible state management library for React.
 * It uses atomic state (atoms) that can be combined to build complex state.
 * npm install jotai
 */

import { atom, useAtom, useAtomValue, useSetAtom, Provider } from 'jotai';
import { atomWithStorage, atomWithReducer, atomFamily, selectAtom } from 'jotai/utils';

// -------------------------------------------------------------------------------------------
// 1. BASIC ATOMS
// -------------------------------------------------------------------------------------------

// Create primitive atoms
const countAtom = atom(0);
const nameAtom = atom('');
const isOpenAtom = atom(false);

// Usage in component
function Counter() {
  const [count, setCount] = useAtom(countAtom);
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}

// Read-only hook
function CountDisplay() {
  const count = useAtomValue(countAtom);
  return <span>{count}</span>;
}

// Write-only hook
function CountButtons() {
  const setCount = useSetAtom(countAtom);
  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
      <button onClick={() => setCount((c) => c - 1)}>-</button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 2. DERIVED ATOMS
// -------------------------------------------------------------------------------------------

/**
 * Read-only derived atoms compute values from other atoms.
 */

const priceAtom = atom(100);
const quantityAtom = atom(1);

// Derived (computed) atom
const totalAtom = atom((get) => get(priceAtom) * get(quantityAtom));

function Total() {
  const total = useAtomValue(totalAtom);
  return <p>Total: ${total}</p>;
}

// Derived from multiple atoms
const todosAtom = atom([]);
const filterAtom = atom('all');

const filteredTodosAtom = atom((get) => {
  const todos = get(todosAtom);
  const filter = get(filterAtom);

  switch (filter) {
    case 'completed':
      return todos.filter((t) => t.completed);
    case 'active':
      return todos.filter((t) => !t.completed);
    default:
      return todos;
  }
});

// -------------------------------------------------------------------------------------------
// 3. WRITABLE DERIVED ATOMS
// -------------------------------------------------------------------------------------------

/**
 * Read-write atoms can have custom setter logic.
 */

const celsiusAtom = atom(0);

// Fahrenheit derived with custom setter
const fahrenheitAtom = atom(
  (get) => get(celsiusAtom) * (9 / 5) + 32,
  (get, set, newFahrenheit) => {
    set(celsiusAtom, (newFahrenheit - 32) * (5 / 9));
  }
);

function Temperature() {
  const [celsius, setCelsius] = useAtom(celsiusAtom);
  const [fahrenheit, setFahrenheit] = useAtom(fahrenheitAtom);

  return (
    <div>
      <input type="number" value={celsius} onChange={(e) => setCelsius(+e.target.value)} />
      <span>°C = </span>
      <input type="number" value={fahrenheit} onChange={(e) => setFahrenheit(+e.target.value)} />
      <span>°F</span>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 4. ASYNC ATOMS
// -------------------------------------------------------------------------------------------

const userIdAtom = atom(1);

const userAtom = atom(async (get) => {
  const id = get(userIdAtom);
  const response = await fetch(`/api/users/${id}`);
  return response.json();
});

function UserProfile() {
  const user = useAtomValue(userAtom);
  return <p>{user.name}</p>;
}

// With Suspense
function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <UserProfile />
    </Suspense>
  );
}

// -------------------------------------------------------------------------------------------
// 5. ATOM UTILITIES
// -------------------------------------------------------------------------------------------

// Persist to localStorage
const themeAtom = atomWithStorage('theme', 'light');

// Atom with reducer
const counterWithReducerAtom = atomWithReducer(0, (prev, action) => {
  switch (action.type) {
    case 'INCREMENT': return prev + 1;
    case 'DECREMENT': return prev - 1;
    case 'SET': return action.payload;
    default: return prev;
  }
});

function CounterWithReducer() {
  const [count, dispatch] = useAtom(counterWithReducerAtom);
  return (
    <div>
      <span>{count}</span>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
    </div>
  );
}

// Atom family (parameterized atoms)
const todoAtomFamily = atomFamily((id) => atom({ id, text: '', completed: false }));

function TodoItem({ id }) {
  const [todo, setTodo] = useAtom(todoAtomFamily(id));
  return <li>{todo.text}</li>;
}

// -------------------------------------------------------------------------------------------
// 6. SELECT ATOM (OPTIMIZED SELECTORS)
// -------------------------------------------------------------------------------------------

/**
 * selectAtom creates a derived atom that only triggers
 * re-renders when the selected value changes.
 */

const userDataAtom = atom({
  name: 'Akash',
  email: 'akash@example.com',
  preferences: { theme: 'dark' },
});

// Only re-renders when name changes
const userNameAtom = selectAtom(userDataAtom, (user) => user.name);

// Only re-renders when theme changes
const userThemeAtom = selectAtom(userDataAtom, (user) => user.preferences.theme);

function UserName() {
  const name = useAtomValue(userNameAtom);
  return <p>{name}</p>;
}

// -------------------------------------------------------------------------------------------
// 7. ACTIONS WITH WRITE-ONLY ATOMS
// -------------------------------------------------------------------------------------------

/**
 * Create action atoms for complex operations.
 */

const addTodoAtom = atom(null, (get, set, text) => {
  set(todosAtom, (todos) => [
    ...todos,
    { id: Date.now(), text, completed: false },
  ]);
});

const toggleTodoAtom = atom(null, (get, set, id) => {
  set(todosAtom, (todos) =>
    todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
  );
});

function AddTodo() {
  const addTodo = useSetAtom(addTodoAtom);
  const [text, setText] = useState('');

  return (
    <form onSubmit={(e) => { e.preventDefault(); addTodo(text); setText(''); }}>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button type="submit">Add</button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 8. PROVIDER AND SCOPE
// -------------------------------------------------------------------------------------------

/**
 * Provider creates isolated state trees.
 * Useful for testing or multiple instances.
 */

function App() {
  return (
    <Provider>
      <Counter />
    </Provider>
  );
}

// Multiple independent counters
function MultipleCounters() {
  return (
    <div>
      <Provider><Counter /></Provider>
      <Provider><Counter /></Provider>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY FEATURES:
 * 1. Atomic state model
 * 2. Derived atoms for computed state
 * 3. Async atoms with Suspense
 * 4. No providers needed (optional)
 *
 * BEST PRACTICES:
 * - Keep atoms small and focused
 * - Use derived atoms for computed values
 * - Use selectAtom for optimized selections
 * - Use atomFamily for dynamic atoms
 * - Use atomWithStorage for persistence
 *
 * VS OTHER LIBRARIES:
 * - Simpler than Redux
 * - More composable than Zustand
 * - Bottom-up approach (atoms first)
 * - Built-in Suspense support
 */
