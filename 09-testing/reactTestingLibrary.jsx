/**
 * TOPIC: REACT TESTING LIBRARY
 * DESCRIPTION:
 * React Testing Library (RTL) tests components from user perspective.
 * It encourages testing behavior, not implementation details.
 * npm install @testing-library/react @testing-library/jest-dom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// -------------------------------------------------------------------------------------------
// 1. BASIC RENDERING
// -------------------------------------------------------------------------------------------

function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}

test('renders greeting with name', () => {
  render(<Greeting name="Akash" />);
  
  expect(screen.getByText('Hello, Akash!')).toBeInTheDocument();
  expect(screen.getByRole('heading')).toHaveTextContent('Hello, Akash!');
});

// -------------------------------------------------------------------------------------------
// 2. QUERIES
// -------------------------------------------------------------------------------------------

/**
 * Priority order:
 * 1. getByRole - accessible
 * 2. getByLabelText - form fields
 * 3. getByPlaceholderText - form fields
 * 4. getByText - non-interactive
 * 5. getByDisplayValue - current value
 * 6. getByAltText - images
 * 7. getByTitle - title attribute
 * 8. getByTestId - last resort
 */

function LoginForm() {
  return (
    <form>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" placeholder="Enter email" />
      
      <label htmlFor="password">Password</label>
      <input id="password" type="password" />
      
      <button type="submit">Sign In</button>
    </form>
  );
}

test('query examples', () => {
  render(<LoginForm />);

  // By role
  screen.getByRole('button', { name: /sign in/i });
  screen.getByRole('textbox', { name: /email/i });

  // By label text
  screen.getByLabelText(/email/i);
  screen.getByLabelText(/password/i);

  // By placeholder
  screen.getByPlaceholderText(/enter email/i);

  // By text
  screen.getByText(/sign in/i);

  // Query variants
  screen.queryByText('Not found'); // Returns null if not found
  // screen.findByText('Async'); // Returns promise, for async
});

// -------------------------------------------------------------------------------------------
// 3. USER EVENTS
// -------------------------------------------------------------------------------------------

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <button onClick={() => setCount(c => c - 1)}>Decrement</button>
    </div>
  );
}

test('counter increments and decrements', async () => {
  const user = userEvent.setup();
  render(<Counter />);

  expect(screen.getByTestId('count')).toHaveTextContent('0');

  await user.click(screen.getByRole('button', { name: /increment/i }));
  expect(screen.getByTestId('count')).toHaveTextContent('1');

  await user.click(screen.getByRole('button', { name: /decrement/i }));
  expect(screen.getByTestId('count')).toHaveTextContent('0');
});

// -------------------------------------------------------------------------------------------
// 4. FORM TESTING
// -------------------------------------------------------------------------------------------

test('form submission', async () => {
  const handleSubmit = jest.fn();
  const user = userEvent.setup();

  function Form({ onSubmit }) {
    const [email, setEmail] = useState('');
    return (
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(email); }}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    );
  }

  render(<Form onSubmit={handleSubmit} />);

  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(handleSubmit).toHaveBeenCalledWith('test@example.com');
});

// -------------------------------------------------------------------------------------------
// 5. ASYNC TESTING
// -------------------------------------------------------------------------------------------

function AsyncComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data')
      .then((res) => res.json())
      .then((data) => { setData(data); setLoading(false); });
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{data.message}</div>;
}

test('loads and displays data', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ message: 'Hello World' }),
    })
  );

  render(<AsyncComponent />);

  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});

// -------------------------------------------------------------------------------------------
// 6. MOCKING
// -------------------------------------------------------------------------------------------

// Mock module
jest.mock('./api', () => ({
  fetchUsers: jest.fn(),
}));

import { fetchUsers } from './api';

test('with mocked module', async () => {
  fetchUsers.mockResolvedValue([{ id: 1, name: 'John' }]);

  render(<UserList />);

  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});

// -------------------------------------------------------------------------------------------
// 7. CONTEXT AND PROVIDERS
// -------------------------------------------------------------------------------------------

const ThemeContext = createContext('light');

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Click me</button>;
}

test('renders with context', () => {
  render(
    <ThemeContext.Provider value="dark">
      <ThemedButton />
    </ThemeContext.Provider>
  );

  expect(screen.getByRole('button')).toHaveClass('dark');
});

// Custom render with providers
function customRender(ui, { theme = 'light', ...options } = {}) {
  return render(
    <ThemeContext.Provider value={theme}>{ui}</ThemeContext.Provider>,
    options
  );
}

test('with custom render', () => {
  customRender(<ThemedButton />, { theme: 'dark' });
  expect(screen.getByRole('button')).toHaveClass('dark');
});

// -------------------------------------------------------------------------------------------
// 8. COMMON MATCHERS
// -------------------------------------------------------------------------------------------

test('jest-dom matchers', () => {
  render(<button disabled>Click</button>);

  const button = screen.getByRole('button');

  expect(button).toBeDisabled();
  expect(button).toBeVisible();
  expect(button).toBeInTheDocument();
  expect(button).toHaveTextContent('Click');
  // expect(button).toHaveClass('btn');
  // expect(button).toHaveAttribute('type', 'button');
  // expect(button).toHaveStyle({ color: 'red' });
});

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * BEST PRACTICES:
 * 1. Query by role first (accessibility)
 * 2. Test behavior, not implementation
 * 3. Use userEvent over fireEvent
 * 4. Avoid testing library internals
 * 5. Use waitFor for async operations
 *
 * QUERY PRIORITY:
 * 1. getByRole
 * 2. getByLabelText
 * 3. getByPlaceholderText
 * 4. getByText
 * 5. getByTestId (last resort)
 *
 * TOOLS:
 * - @testing-library/react
 * - @testing-library/user-event
 * - @testing-library/jest-dom
 * - jest (test runner)
 */
