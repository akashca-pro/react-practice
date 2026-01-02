/**
 * TOPIC: CONTEXT API
 * DESCRIPTION:
 * React Context provides a way to share values between components
 * without explicitly passing props through every level of the tree.
 * It's ideal for global state like themes, auth, and locale.
 */

import { createContext, useContext, useState, useMemo, useCallback, useReducer } from 'react';

// -------------------------------------------------------------------------------------------
// 1. BASIC CONTEXT SETUP
// -------------------------------------------------------------------------------------------

// Step 1: Create context
const ThemeContext = createContext(null);

// Step 2: Create provider component
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  // Memoize to prevent unnecessary re-renders
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Step 3: Create custom hook
function useTheme() {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Step 4: Usage
function ThemedButton() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      style={{ background: theme === 'light' ? '#fff' : '#333' }}
    >
      Toggle Theme
    </button>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ThemedButton />
    </ThemeProvider>
  );
}

// -------------------------------------------------------------------------------------------
// 2. AUTHENTICATION CONTEXT
// -------------------------------------------------------------------------------------------

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    const user = await response.json();
    setUser(user);
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/logout', { method: 'POST' });
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
}

// Usage
function ProtectedComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return <p>Please log in</p>;
  return (
    <div>
      <p>Welcome, {user.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 3. CONTEXT WITH REDUCER
// -------------------------------------------------------------------------------------------

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };
    case 'CLEAR':
      return { ...state, items: [] };
    default:
      return state;
  }
}

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addItem = useCallback((item) => dispatch({ type: 'ADD_ITEM', payload: item }), []);
  const removeItem = useCallback((id) => dispatch({ type: 'REMOVE_ITEM', payload: id }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  const total = useMemo(() => {
    return state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }, [state.items]);

  const value = useMemo(() => ({
    items: state.items,
    total,
    addItem,
    removeItem,
    clearCart,
  }), [state.items, total, addItem, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// -------------------------------------------------------------------------------------------
// 4. SPLIT CONTEXTS FOR OPTIMIZATION
// -------------------------------------------------------------------------------------------

/**
 * Split state and dispatch into separate contexts.
 * Components only re-render when their specific context changes.
 */

const CountStateContext = createContext(0);
const CountDispatchContext = createContext(() => {});

function CountProvider({ children }) {
  const [count, setCount] = useState(0);

  return (
    <CountStateContext.Provider value={count}>
      <CountDispatchContext.Provider value={setCount}>
        {children}
      </CountDispatchContext.Provider>
    </CountStateContext.Provider>
  );
}

// Only re-renders when count changes
function CountDisplay() {
  const count = useContext(CountStateContext);
  return <span>{count}</span>;
}

// Never re-renders (setCount is stable)
function CountButtons() {
  const setCount = useContext(CountDispatchContext);
  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
      <button onClick={() => setCount((c) => c - 1)}>-</button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 5. COMPOSING PROVIDERS
// -------------------------------------------------------------------------------------------

function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Root app
function Root() {
  return (
    <AppProviders>
      <App />
    </AppProviders>
  );
}

// -------------------------------------------------------------------------------------------
// 6. WHEN TO USE CONTEXT
// -------------------------------------------------------------------------------------------

/**
 * USE CONTEXT FOR:
 * - Theme, locale, user preferences
 * - Authentication state
 * - UI state (modals, sidebars)
 * - Data needed by many components
 *
 * AVOID CONTEXT FOR:
 * - Frequently changing values
 * - Server state (use React Query)
 * - Local component state
 */

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. createContext + Provider + useContext
 * 2. Avoids prop drilling
 * 3. All consumers re-render on change
 * 4. Create custom hooks for type safety
 *
 * BEST PRACTICES:
 * - Memoize context value
 * - Split contexts by update frequency
 * - Create custom hooks with error handling
 * - Keep providers close to usage
 * - Use reducer for complex state
 */
