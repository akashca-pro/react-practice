/**
 * TOPIC: useReducer HOOK
 * DESCRIPTION:
 * useReducer manages complex state logic with a reducer function.
 * It's an alternative to useState for state with multiple sub-values
 * or when next state depends on previous state.
 */

import { useReducer, useContext, createContext } from 'react';

// -------------------------------------------------------------------------------------------
// 1. BASIC USAGE
// -------------------------------------------------------------------------------------------

// Reducer function: (state, action) => newState
function counterReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    case 'RESET':
      return { count: 0 };
    case 'SET':
      return { count: action.payload };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

function Counter() {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
      <button onClick={() => dispatch({ type: 'SET', payload: 10 })}>Set 10</button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 2. COMPLEX STATE
// -------------------------------------------------------------------------------------------

const initialState = {
  items: [],
  loading: false,
  error: null,
};

function todoReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, items: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_TODO':
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_TODO':
      return { ...state, items: state.items.filter((t) => t.id !== action.payload) };
    case 'TOGGLE_TODO':
      return {
        ...state,
        items: state.items.map((t) =>
          t.id === action.payload ? { ...t, completed: !t.completed } : t
        ),
      };
    default:
      return state;
  }
}

function TodoList() {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  const addTodo = (text) => {
    dispatch({ type: 'ADD_TODO', payload: { id: Date.now(), text, completed: false } });
  };

  return (
    <div>
      {state.loading && <p>Loading...</p>}
      {state.error && <p>Error: {state.error}</p>}
      <ul>
        {state.items.map((todo) => (
          <li key={todo.id} onClick={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })}>
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 3. LAZY INITIALIZATION
// -------------------------------------------------------------------------------------------

function init(initialCount) {
  return { count: initialCount };
}

function LazyCounter({ initialCount }) {
  const [state, dispatch] = useReducer(counterReducer, initialCount, init);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'RESET', payload: initialCount })}>
        Reset to {initialCount}
      </button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 4. ACTION CREATORS
// -------------------------------------------------------------------------------------------

// Action creators for consistency
const actions = {
  increment: () => ({ type: 'INCREMENT' }),
  decrement: () => ({ type: 'DECREMENT' }),
  reset: () => ({ type: 'RESET' }),
  set: (value) => ({ type: 'SET', payload: value }),
};

function CounterWithActions() {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch(actions.increment())}>+</button>
      <button onClick={() => dispatch(actions.set(100))}>Set 100</button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 5. useReducer WITH CONTEXT
// -------------------------------------------------------------------------------------------

const StateContext = createContext(null);
const DispatchContext = createContext(null);

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// Custom hooks
function useTodoState() {
  const context = useContext(StateContext);
  if (!context) throw new Error('useTodoState must be within AppProvider');
  return context;
}

function useTodoDispatch() {
  const context = useContext(DispatchContext);
  if (!context) throw new Error('useTodoDispatch must be within AppProvider');
  return context;
}

// Usage in components
function TodoItem({ todo }) {
  const dispatch = useTodoDispatch();
  return (
    <li onClick={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })}>
      {todo.text}
    </li>
  );
}

// -------------------------------------------------------------------------------------------
// 6. useState VS useReducer
// -------------------------------------------------------------------------------------------

/**
 * USE useState:
 * - Simple state (primitives, simple objects)
 * - Few state transitions
 * - Independent state variables
 *
 * USE useReducer:
 * - Complex state logic
 * - Many state transitions
 * - Related state that should update together
 * - State dependencies on previous values
 * - Testing (reducer is pure function)
 */

// useState version
function FormWithState() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Many separate setters...
}

// useReducer version - cleaner for related state
function formReducer(state, action) {
  switch (action.type) {
    case 'FIELD_CHANGE':
      return { ...state, [action.field]: action.value };
    case 'SUBMIT_START':
      return { ...state, loading: true, error: null };
    case 'SUBMIT_SUCCESS':
      return { ...state, loading: false };
    case 'SUBMIT_ERROR':
      return { ...state, loading: false, error: action.error };
    case 'RESET':
      return action.initialState;
  }
}

function FormWithReducer() {
  const [state, dispatch] = useReducer(formReducer, {
    name: '', email: '', loading: false, error: null,
  });

  const handleChange = (e) => {
    dispatch({ type: 'FIELD_CHANGE', field: e.target.name, value: e.target.value });
  };

  return (
    <input name="name" value={state.name} onChange={handleChange} />
  );
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. useReducer uses a reducer function for state updates
 * 2. dispatch sends actions to the reducer
 * 3. Reducer must be pure: (state, action) => newState
 * 4. Great for complex state logic
 *
 * BEST PRACTICES:
 * - Keep reducer pure (no side effects)
 * - Use action creators for consistency
 * - Split dispatch and state contexts
 * - Handle unknown actions (throw or return state)
 * - Use TypeScript for action type safety
 *
 * PATTERNS:
 * - useReducer + useContext = Mini Redux
 * - Lazy initialization for expensive initial state
 * - Split reducers for large state
 */
