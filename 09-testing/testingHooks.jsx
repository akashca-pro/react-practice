/**
 * TOPIC: TESTING HOOKS
 * DESCRIPTION:
 * Test custom hooks using @testing-library/react-hooks.
 * Hooks must be tested within a component context.
 * npm install @testing-library/react-hooks
 */

import { renderHook, act } from '@testing-library/react';

// -------------------------------------------------------------------------------------------
// 1. TESTING BASIC HOOKS
// -------------------------------------------------------------------------------------------

function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => c - 1);
  const reset = () => setCount(initialValue);
  return { count, increment, decrement, reset };
}

test('useCounter hook', () => {
  const { result } = renderHook(() => useCounter(5));

  expect(result.current.count).toBe(5);

  act(() => {
    result.current.increment();
  });
  expect(result.current.count).toBe(6);

  act(() => {
    result.current.decrement();
  });
  expect(result.current.count).toBe(5);

  act(() => {
    result.current.reset();
  });
  expect(result.current.count).toBe(5);
});

// -------------------------------------------------------------------------------------------
// 2. HOOKS WITH INITIAL PROPS
// -------------------------------------------------------------------------------------------

function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

test('useDocumentTitle updates title', () => {
  const { rerender } = renderHook(
    ({ title }) => useDocumentTitle(title),
    { initialProps: { title: 'Initial Title' } }
  );

  expect(document.title).toBe('Initial Title');

  rerender({ title: 'New Title' });
  expect(document.title).toBe('New Title');
});

// -------------------------------------------------------------------------------------------
// 3. ASYNC HOOKS
// -------------------------------------------------------------------------------------------

function useFetch(url) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

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

  return state;
}

test('useFetch hook', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ message: 'Hello' }),
    })
  );

  const { result } = renderHook(() => useFetch('/api/data'));

  expect(result.current.loading).toBe(true);

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.data).toEqual({ message: 'Hello' });
  expect(result.current.error).toBeNull();
});

// -------------------------------------------------------------------------------------------
// 4. HOOKS WITH CONTEXT
// -------------------------------------------------------------------------------------------

const ThemeContext = createContext('light');

function useTheme() {
  return useContext(ThemeContext);
}

test('useTheme with provider', () => {
  const wrapper = ({ children }) => (
    <ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>
  );

  const { result } = renderHook(() => useTheme(), { wrapper });

  expect(result.current).toBe('dark');
});

// -------------------------------------------------------------------------------------------
// 5. TESTING useReducer HOOKS
// -------------------------------------------------------------------------------------------

function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [...state, { id: Date.now(), text: action.text, done: false }];
    case 'TOGGLE':
      return state.map((t) =>
        t.id === action.id ? { ...t, done: !t.done } : t
      );
    case 'DELETE':
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

function useTodos() {
  const [todos, dispatch] = useReducer(todoReducer, []);

  const addTodo = (text) => dispatch({ type: 'ADD', text });
  const toggleTodo = (id) => dispatch({ type: 'TOGGLE', id });
  const deleteTodo = (id) => dispatch({ type: 'DELETE', id });

  return { todos, addTodo, toggleTodo, deleteTodo };
}

test('useTodos hook', () => {
  const { result } = renderHook(() => useTodos());

  expect(result.current.todos).toHaveLength(0);

  act(() => {
    result.current.addTodo('Learn testing');
  });

  expect(result.current.todos).toHaveLength(1);
  expect(result.current.todos[0].text).toBe('Learn testing');
  expect(result.current.todos[0].done).toBe(false);

  act(() => {
    result.current.toggleTodo(result.current.todos[0].id);
  });

  expect(result.current.todos[0].done).toBe(true);

  act(() => {
    result.current.deleteTodo(result.current.todos[0].id);
  });

  expect(result.current.todos).toHaveLength(0);
});

// -------------------------------------------------------------------------------------------
// 6. HOOKS WITH TIMERS
// -------------------------------------------------------------------------------------------

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

test('useDebounce hook', () => {
  jest.useFakeTimers();

  const { result, rerender } = renderHook(
    ({ value, delay }) => useDebounce(value, delay),
    { initialProps: { value: 'initial', delay: 500 } }
  );

  expect(result.current).toBe('initial');

  rerender({ value: 'updated', delay: 500 });
  expect(result.current).toBe('initial'); // Not updated yet

  act(() => {
    jest.advanceTimersByTime(500);
  });

  expect(result.current).toBe('updated');

  jest.useRealTimers();
});

// -------------------------------------------------------------------------------------------
// 7. HOOKS WITH CLEANUP
// -------------------------------------------------------------------------------------------

function useEventListener(event, handler) {
  useEffect(() => {
    window.addEventListener(event, handler);
    return () => window.removeEventListener(event, handler);
  }, [event, handler]);
}

test('useEventListener cleanup', () => {
  const addSpy = jest.spyOn(window, 'addEventListener');
  const removeSpy = jest.spyOn(window, 'removeEventListener');
  const handler = jest.fn();

  const { unmount } = renderHook(() => useEventListener('click', handler));

  expect(addSpy).toHaveBeenCalledWith('click', handler);

  unmount();

  expect(removeSpy).toHaveBeenCalledWith('click', handler);

  addSpy.mockRestore();
  removeSpy.mockRestore();
});

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Use renderHook to test hooks in isolation
 * 2. Wrap state updates in act()
 * 3. Use rerender for prop changes
 * 4. Provide wrapper for context
 *
 * BEST PRACTICES:
 * - Test hook behavior, not implementation
 * - Test with different initial values
 * - Test cleanup functions
 * - Mock timers for debounce/throttle
 * - Use waitFor for async hooks
 */
