/**
 * TOPIC: useContext HOOK
 * DESCRIPTION:
 * useContext provides a way to pass data through the component tree
 * without prop drilling. It's React's built-in solution for sharing
 * state across many components.
 */

import { createContext, useContext, useState, useMemo } from 'react';

// -------------------------------------------------------------------------------------------
// 1. CREATING AND USING CONTEXT
// -------------------------------------------------------------------------------------------

// 1. Create context with default value
const ThemeContext = createContext('light');

// 2. Provider component
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Consume with useContext
function ThemedButton() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      style={{ background: theme === 'light' ? '#fff' : '#333' }}
    >
      Toggle Theme
    </button>
  );
}

// 4. Usage in App
function App() {
  return (
    <ThemeProvider>
      <ThemedButton />
    </ThemeProvider>
  );
}

// -------------------------------------------------------------------------------------------
// 2. CONTEXT WITH CUSTOM HOOK
// -------------------------------------------------------------------------------------------

/**
 * Best practice: Create custom hook for consuming context.
 */

const UserContext = createContext(null);

function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  const value = useMemo(() => ({
    user, login, logout, isAuthenticated: !!user,
  }), [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Custom hook with error handling
function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

// Usage
function Profile() {
  const { user, logout, isAuthenticated } = useUser();

  if (!isAuthenticated) return <p>Please log in</p>;
  return (
    <div>
      <p>Welcome, {user.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 3. MULTIPLE CONTEXTS
// -------------------------------------------------------------------------------------------

function AppWithMultipleContexts() {
  return (
    <ThemeProvider>
      <UserProvider>
        <NotificationProvider>
          <MainContent />
        </NotificationProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

// Combine providers for cleaner JSX
function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

// -------------------------------------------------------------------------------------------
// 4. OPTIMIZING CONTEXT
// -------------------------------------------------------------------------------------------

/**
 * Context changes cause all consumers to re-render.
 * Optimize by:
 * 1. Memoizing context value
 * 2. Splitting contexts
 * 3. Memoizing consumers
 */

// Problem: New object on every render
function BadProvider({ children }) {
  const [count, setCount] = useState(0);
  // Creates new object every render!
  return (
    <MyContext.Provider value={{ count, setCount }}>
      {children}
    </MyContext.Provider>
  );
}

// Solution: Memoize the value
function GoodProvider({ children }) {
  const [count, setCount] = useState(0);
  const value = useMemo(() => ({ count, setCount }), [count]);
  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}

// Split contexts for different update frequencies
const CountContext = createContext(0);
const SetCountContext = createContext(() => {});

function SplitProvider({ children }) {
  const [count, setCount] = useState(0);

  return (
    <CountContext.Provider value={count}>
      <SetCountContext.Provider value={setCount}>
        {children}
      </SetCountContext.Provider>
    </CountContext.Provider>
  );
}

// Only re-renders when count changes
function CountDisplay() {
  const count = useContext(CountContext);
  return <p>Count: {count}</p>;
}

// Never re-renders (setCount is stable)
function CountButton() {
  const setCount = useContext(SetCountContext);
  return <button onClick={() => setCount((c) => c + 1)}>+1</button>;
}

// -------------------------------------------------------------------------------------------
// 5. COMMON PATTERNS
// -------------------------------------------------------------------------------------------

// Auth context
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth().then(setUser).finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login: async (credentials) => {
      const user = await loginApi(credentials);
      setUser(user);
    },
    logout: async () => {
      await logoutApi();
      setUser(null);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Modal context
const ModalContext = createContext(null);

function ModalProvider({ children }) {
  const [modals, setModals] = useState([]);

  const open = (component, props) => {
    setModals((prev) => [...prev, { component, props, id: Date.now() }]);
  };

  const close = (id) => {
    setModals((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <ModalContext.Provider value={{ open, close }}>
      {children}
      {modals.map(({ component: Modal, props, id }) => (
        <Modal key={id} {...props} onClose={() => close(id)} />
      ))}
    </ModalContext.Provider>
  );
}

// -------------------------------------------------------------------------------------------
// 6. CONTEXT VS OTHER STATE SOLUTIONS
// -------------------------------------------------------------------------------------------

/**
 * USE CONTEXT FOR:
 * - Theme, locale, auth state
 * - Data shared by many components
 * - Avoiding prop drilling
 *
 * CONSIDER ALTERNATIVES FOR:
 * - Frequently updating state (use state management library)
 * - Complex state logic (use useReducer + context or Redux)
 * - Server state (use React Query, SWR)
 */

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Context avoids prop drilling
 * 2. createContext + Provider + useContext
 * 3. All consumers re-render on context change
 * 4. Create custom hooks for consuming context
 *
 * BEST PRACTICES:
 * - Memoize context value with useMemo
 * - Split contexts by update frequency
 * - Create custom hooks with error handling
 * - Keep context close to where it's used
 * - Don't overuse - not every shared state needs context
 *
 * COMMON MISTAKES:
 * - Not memoizing context value
 * - Using context for frequently updating state
 * - Having one giant context for everything
 */
