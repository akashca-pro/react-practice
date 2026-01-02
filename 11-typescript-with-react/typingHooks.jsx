/**
 * TOPIC: TYPING HOOKS
 * DESCRIPTION:
 * TypeScript type annotations for React hooks ensure
 * type safety throughout component logic.
 */

import {
  useState,
  useEffect,
  useRef,
  useReducer,
  useContext,
  useCallback,
  useMemo,
  createContext,
} from 'react';

// -------------------------------------------------------------------------------------------
// 1. useState
// -------------------------------------------------------------------------------------------

function UseStateExamples() {
  // Inferred types
  const [count, setCount] = useState(0); // number
  const [name, setName] = useState(''); // string

  // Explicit types for complex state
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Object state
  interface FormData {
    email: string;
    password: string;
  }
  const [form, setForm] = useState<FormData>({ email: '', password: '' });

  // Lazy initialization
  const [data, setData] = useState<number[]>(() => {
    return JSON.parse(localStorage.getItem('data') || '[]');
  });
}

// -------------------------------------------------------------------------------------------
// 2. useRef
// -------------------------------------------------------------------------------------------

function UseRefExamples() {
  // DOM refs - initialize with null
  const inputRef = useRef<HTMLInputElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mutable refs - provide initial value
  const countRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previousValue = useRef<string | undefined>(undefined);

  useEffect(() => {
    // TypeScript knows inputRef.current might be null
    inputRef.current?.focus();
    
    // Mutable ref doesn't need null check
    countRef.current += 1;
  }, []);
}

// -------------------------------------------------------------------------------------------
// 3. useReducer
// -------------------------------------------------------------------------------------------

// State type
interface State {
  count: number;
  loading: boolean;
  error: string | null;
}

// Action types with discriminated union
type Action =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'SET_COUNT'; payload: number }
  | { type: 'SET_ERROR'; payload: string };

const initialState: State = {
  count: 0,
  loading: false,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    case 'SET_COUNT':
      return { ...state, count: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // TypeScript enforces valid actions
  dispatch({ type: 'INCREMENT' });
  dispatch({ type: 'SET_COUNT', payload: 10 });
  // dispatch({ type: 'INVALID' }); // Error!
}

// -------------------------------------------------------------------------------------------
// 4. useContext
// -------------------------------------------------------------------------------------------

// Define context type
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create with proper type
const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook with type guard
function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Provider component
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login: async (email, password) => {
      const user = await loginAPI(email, password);
      setUser(user);
    },
    logout: () => setUser(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// -------------------------------------------------------------------------------------------
// 5. useCallback
// -------------------------------------------------------------------------------------------

function UseCallbackExamples() {
  const [items, setItems] = useState<string[]>([]);

  // Type is inferred from function
  const addItem = useCallback((item: string) => {
    setItems((prev) => [...prev, item]);
  }, []);

  // Explicit return type
  const getItem = useCallback((index: number): string | undefined => {
    return items[index];
  }, [items]);

  // Event handler types
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    console.log(e.currentTarget.name);
  }, []);
}

// -------------------------------------------------------------------------------------------
// 6. useMemo
// -------------------------------------------------------------------------------------------

interface Product {
  id: number;
  name: string;
  price: number;
}

function UseMemoExamples({ products }: { products: Product[] }) {
  // Type inferred from return value
  const total = useMemo(() => {
    return products.reduce((sum, p) => sum + p.price, 0);
  }, [products]);

  // Explicit generic type
  const sortedProducts = useMemo<Product[]>(() => {
    return [...products].sort((a, b) => a.price - b.price);
  }, [products]);

  // Complex object
  const summary = useMemo(() => ({
    count: products.length,
    total: products.reduce((sum, p) => sum + p.price, 0),
    average: products.reduce((sum, p) => sum + p.price, 0) / products.length,
  }), [products]);
}

// -------------------------------------------------------------------------------------------
// 7. CUSTOM HOOKS WITH GENERICS
// -------------------------------------------------------------------------------------------

// Generic fetch hook
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json() as Promise<T>)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}

// Usage
function UserProfile({ userId }: { userId: string }) {
  const { data, loading, error } = useFetch<User>(`/api/users/${userId}`);
  // data is typed as User | null
}

// Generic local storage hook
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue] as const;
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * HOOK TYPING PATTERNS:
 * - useState<T>: Explicit for complex types
 * - useRef<T>(null): DOM elements
 * - useRef<T>(initial): Mutable values
 * - useReducer: Discriminated union actions
 * - useContext: null check or custom hook
 *
 * BEST PRACTICES:
 * - Let TypeScript infer when possible
 * - Use generics for reusable hooks
 * - Type actions with discriminated unions
 * - Create custom hooks with proper types
 * - Use 'as const' for tuple returns
 */
