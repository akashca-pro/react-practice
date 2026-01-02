/**
 * TOPIC: useSyncExternalStore HOOK
 * DESCRIPTION:
 * useSyncExternalStore subscribes to external stores in a way that's
 * compatible with concurrent rendering. Essential for integrating
 * non-React state management with React 18.
 */

import { useSyncExternalStore, useCallback } from 'react';

// -------------------------------------------------------------------------------------------
// 1. BASIC USAGE
// -------------------------------------------------------------------------------------------

/**
 * useSyncExternalStore takes:
 * - subscribe: Function to subscribe to the store
 * - getSnapshot: Function to get current state value
 * - getServerSnapshot: (optional) For SSR
 */

// External store (could be any state outside React)
let listeners = [];
let state = { count: 0 };

const store = {
  getState: () => state,
  setState: (newState) => {
    state = { ...state, ...newState };
    listeners.forEach((listener) => listener());
  },
  subscribe: (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
};

// Using the external store in React
function Counter() {
  const count = useSyncExternalStore(
    store.subscribe,
    () => store.getState().count
  );

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => store.setState({ count: count + 1 })}>
        Increment
      </button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 2. BROWSER APIs
// -------------------------------------------------------------------------------------------

/**
 * Use for browser APIs that change over time.
 */

// Window size
function useWindowSize() {
  const getSnapshot = () => ({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const subscribe = (callback) => {
    window.addEventListener('resize', callback);
    return () => window.removeEventListener('resize', callback);
  };

  // Need to return same object reference for same values
  const size = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(getSnapshot())
  );

  return JSON.parse(size);
}

// Online status
function useOnlineStatus() {
  const subscribe = (callback) => {
    window.addEventListener('online', callback);
    window.addEventListener('offline', callback);
    return () => {
      window.removeEventListener('online', callback);
      window.removeEventListener('offline', callback);
    };
  };

  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true // Server snapshot (assume online)
  );
}

function OnlineIndicator() {
  const isOnline = useOnlineStatus();
  return <div>{isOnline ? '🟢 Online' : '🔴 Offline'}</div>;
}

// -------------------------------------------------------------------------------------------
// 3. MEDIA QUERIES
// -------------------------------------------------------------------------------------------

function useMediaQuery(query) {
  const subscribe = useCallback(
    (callback) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener('change', callback);
      return () => mediaQuery.removeEventListener('change', callback);
    },
    [query]
  );

  const getSnapshot = () => window.matchMedia(query).matches;

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  return (
    <div>
      <p>Mobile: {isMobile ? 'Yes' : 'No'}</p>
      <p>Dark mode preferred: {prefersDark ? 'Yes' : 'No'}</p>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 4. LOCAL STORAGE
// -------------------------------------------------------------------------------------------

function useLocalStorage(key) {
  const subscribe = (callback) => {
    const handleStorage = (e) => {
      if (e.key === key) callback();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  };

  const getSnapshot = () => localStorage.getItem(key);

  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

// -------------------------------------------------------------------------------------------
// 5. HISTORY API
// -------------------------------------------------------------------------------------------

function useHistoryState() {
  const subscribe = (callback) => {
    window.addEventListener('popstate', callback);
    return () => window.removeEventListener('popstate', callback);
  };

  const getSnapshot = () => window.history.state;

  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

// -------------------------------------------------------------------------------------------
// 6. CUSTOM STORE PATTERN
// -------------------------------------------------------------------------------------------

function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();

  return {
    getState: () => state,
    setState: (updater) => {
      state = typeof updater === 'function' ? updater(state) : updater;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

// Create a typed store
const todoStore = createStore({ todos: [], filter: 'all' });

// Hook to use the store
function useTodoStore(selector) {
  return useSyncExternalStore(
    todoStore.subscribe,
    () => selector(todoStore.getState())
  );
}

// Usage
function TodoList() {
  const todos = useTodoStore((state) => state.todos);
  const filter = useTodoStore((state) => state.filter);

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'completed') return todo.done;
    if (filter === 'active') return !todo.done;
    return true;
  });

  return <ul>{filteredTodos.map((t) => <li key={t.id}>{t.text}</li>)}</ul>;
}

// -------------------------------------------------------------------------------------------
// 7. INTEGRATING THIRD-PARTY STORES
// -------------------------------------------------------------------------------------------

/**
 * Use for Redux, MobX, or any external state library.
 */

// Redux integration
import { store } from './store';

function useSelector(selector) {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState())
  );
}

// Usage
function CartCount() {
  const count = useSelector((state) => state.cart.items.length);
  return <span>Cart: {count}</span>;
}

// -------------------------------------------------------------------------------------------
// 8. SSR CONSIDERATIONS
// -------------------------------------------------------------------------------------------

function useMediaQuerySSR(query) {
  return useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', callback);
      return () => mq.removeEventListener('change', callback);
    },
    () => window.matchMedia(query).matches,
    () => false // Return default for SSR
  );
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * USE CASES:
 * 1. Browser APIs (online, resize, media queries)
 * 2. Third-party state libraries
 * 3. Local/Session storage
 * 4. Custom external stores
 * 5. WebSocket connections
 *
 * KEY POINTS:
 * - Works with concurrent rendering
 * - getSnapshot must return immutable value
 * - subscribe must return unsubscribe function
 * - Provide getServerSnapshot for SSR
 *
 * BEST PRACTICES:
 * - Keep getSnapshot pure
 * - Return same object for same values
 * - Use selectors for partial state
 * - Memoize subscribe with useCallback if deps exist
 */
