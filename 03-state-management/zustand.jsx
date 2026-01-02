/**
 * TOPIC: ZUSTAND
 * DESCRIPTION:
 * Zustand is a minimal, fast state management library for React.
 * It has a simple API, no boilerplate, and works outside React components.
 * npm install zustand
 */

import { create } from 'zustand';
import { persist, devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// -------------------------------------------------------------------------------------------
// 1. BASIC STORE
// -------------------------------------------------------------------------------------------

const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  setCount: (value) => set({ count: value }),
}));

// Usage in component
function Counter() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return <button onClick={increment}>{count}</button>;
}

// Get multiple values
function CounterDisplay() {
  const { count, increment, decrement } = useCounterStore();
  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 2. COMPLEX STATE
// -------------------------------------------------------------------------------------------

const useTodoStore = create((set, get) => ({
  todos: [],
  filter: 'all',

  // Actions
  addTodo: (text) =>
    set((state) => ({
      todos: [...state.todos, { id: Date.now(), text, completed: false }],
    })),

  removeTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
    })),

  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    })),

  setFilter: (filter) => set({ filter }),

  // Computed values with get()
  getFilteredTodos: () => {
    const { todos, filter } = get();
    switch (filter) {
      case 'completed':
        return todos.filter((t) => t.completed);
      case 'active':
        return todos.filter((t) => !t.completed);
      default:
        return todos;
    }
  },

  // Clear completed
  clearCompleted: () =>
    set((state) => ({
      todos: state.todos.filter((t) => !t.completed),
    })),
}));

// -------------------------------------------------------------------------------------------
// 3. SELECTORS FOR OPTIMIZATION
// -------------------------------------------------------------------------------------------

/**
 * Using selectors prevents unnecessary re-renders.
 * Component only re-renders when selected state changes.
 */

// Only re-renders when todos change
function TodoList() {
  const todos = useTodoStore((state) => state.todos);
  return <ul>{todos.map((t) => <li key={t.id}>{t.text}</li>)}</ul>;
}

// Only re-renders when filter changes
function FilterButtons() {
  const filter = useTodoStore((state) => state.filter);
  const setFilter = useTodoStore((state) => state.setFilter);
  // ...
}

// Shallow comparison for object selections
import { shallow } from 'zustand/shallow';

function TodoStats() {
  const { total, completed } = useTodoStore(
    (state) => ({
      total: state.todos.length,
      completed: state.todos.filter((t) => t.completed).length,
    }),
    shallow // Use shallow comparison
  );

  return <p>{completed}/{total} completed</p>;
}

// -------------------------------------------------------------------------------------------
// 4. ASYNC ACTIONS
// -------------------------------------------------------------------------------------------

const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,

  fetchUser: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/users/${id}`);
      const user = await response.json();
      set({ user, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  logout: () => set({ user: null }),
}));

// -------------------------------------------------------------------------------------------
// 5. MIDDLEWARE
// -------------------------------------------------------------------------------------------

// Persist to localStorage
const usePersistStore = create(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage', // localStorage key
      // Optional: partialize to persist specific state
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

// DevTools integration
const useDevToolsStore = create(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((s) => ({ count: s.count + 1 }), false, 'increment'),
    }),
    { name: 'CounterStore' }
  )
);

// Immer for easier nested updates
const useImmerStore = create(
  immer((set) => ({
    user: { name: 'Akash', preferences: { theme: 'dark' } },
    updateTheme: (theme) =>
      set((state) => {
        state.user.preferences.theme = theme; // "Mutate" directly
      }),
  }))
);

// -------------------------------------------------------------------------------------------
// 6. SUBSCRIBING TO CHANGES
// -------------------------------------------------------------------------------------------

// Subscribe outside React
const unsubscribe = useTodoStore.subscribe(
  (state) => console.log('State changed:', state)
);

// Subscribe to specific value
const useSubscribeStore = create(
  subscribeWithSelector((set) => ({
    count: 0,
    increment: () => set((s) => ({ count: s.count + 1 })),
  }))
);

useSubscribeStore.subscribe(
  (state) => state.count,
  (count, prevCount) => console.log(`Count: ${prevCount} -> ${count}`)
);

// -------------------------------------------------------------------------------------------
// 7. ACCESS OUTSIDE REACT
// -------------------------------------------------------------------------------------------

// Get state outside components
const currentCount = useCounterStore.getState().count;

// Set state outside components
useCounterStore.setState({ count: 10 });

// Call actions outside components
useCounterStore.getState().increment();

// -------------------------------------------------------------------------------------------
// 8. SLICES PATTERN
// -------------------------------------------------------------------------------------------

/**
 * Split store into slices for large applications.
 */

const createUserSlice = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
});

const createCartSlice = (set) => ({
  items: [],
  addItem: (item) => set((s) => ({ items: [...s.items, item] })),
});

const useBoundStore = create((...a) => ({
  ...createUserSlice(...a),
  ...createCartSlice(...a),
}));

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY FEATURES:
 * 1. Minimal API, no boilerplate
 * 2. Works with or without React
 * 3. Built-in DevTools and persistence
 * 4. Supports selectors for optimization
 *
 * BEST PRACTICES:
 * - Use selectors to prevent re-renders
 * - Use shallow for object selections
 * - Split into slices for large stores
 * - Use immer middleware for nested state
 * - Use persist for localStorage sync
 *
 * VS REDUX:
 * - Less boilerplate
 * - No providers needed
 * - Simpler async handling
 * - Works outside React
 */
