/**
 * TOPIC: MOCKING IN TESTS
 * DESCRIPTION:
 * Mocking isolates components from dependencies like APIs, modules,
 * and external services for reliable, fast unit tests.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// -------------------------------------------------------------------------------------------
// 1. MOCKING FUNCTIONS
// -------------------------------------------------------------------------------------------

test('mock function', () => {
  const mockFn = jest.fn();
  mockFn('arg1', 'arg2');

  expect(mockFn).toHaveBeenCalled();
  expect(mockFn).toHaveBeenCalledTimes(1);
  expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
});

test('mock return values', () => {
  const mockFn = jest.fn()
    .mockReturnValue(10)
    .mockReturnValueOnce(5)
    .mockReturnValueOnce(15);

  expect(mockFn()).toBe(5);  // First call
  expect(mockFn()).toBe(15); // Second call
  expect(mockFn()).toBe(10); // Default
});

test('mock implementation', () => {
  const mockFn = jest.fn((x) => x * 2);
  expect(mockFn(5)).toBe(10);

  // Async mock
  const asyncMock = jest.fn().mockResolvedValue('data');
  await expect(asyncMock()).resolves.toBe('data');
});

// -------------------------------------------------------------------------------------------
// 2. MOCKING MODULES
// -------------------------------------------------------------------------------------------

// Mock entire module
jest.mock('./api', () => ({
  fetchUsers: jest.fn(),
  createUser: jest.fn(),
}));

import { fetchUsers, createUser } from './api';

test('mocked module', async () => {
  fetchUsers.mockResolvedValue([{ id: 1, name: 'John' }]);

  render(<UserList />);

  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  expect(fetchUsers).toHaveBeenCalledTimes(1);
});

// -------------------------------------------------------------------------------------------
// 3. MOCKING FETCH
// -------------------------------------------------------------------------------------------

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  global.fetch.mockClear();
});

test('mock fetch success', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ name: 'John' }),
  });

  render(<UserProfile userId="1" />);

  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  expect(global.fetch).toHaveBeenCalledWith('/api/users/1');
});

test('mock fetch error', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    status: 404,
  });

  render(<UserProfile userId="999" />);

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});

// -------------------------------------------------------------------------------------------
// 4. MOCKING AXIOS
// -------------------------------------------------------------------------------------------

jest.mock('axios');
import axios from 'axios';

test('mock axios', async () => {
  axios.get.mockResolvedValueOnce({
    data: { users: [{ id: 1, name: 'Jane' }] },
  });

  render(<UserList />);

  await waitFor(() => {
    expect(screen.getByText('Jane')).toBeInTheDocument();
  });

  expect(axios.get).toHaveBeenCalledWith('/api/users');
});

// -------------------------------------------------------------------------------------------
// 5. MOCKING TIMERS
// -------------------------------------------------------------------------------------------

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test('debounced search', async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  render(<SearchInput onSearch={mockSearch} />);

  await user.type(screen.getByRole('textbox'), 'test');

  // Not called yet (debounced)
  expect(mockSearch).not.toHaveBeenCalled();

  // Advance past debounce delay
  jest.advanceTimersByTime(300);

  expect(mockSearch).toHaveBeenCalledWith('test');
});

// -------------------------------------------------------------------------------------------
// 6. MOCKING REACT ROUTER
// -------------------------------------------------------------------------------------------

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '123' }),
}));

const mockNavigate = jest.fn();

test('navigation', async () => {
  render(<LogoutButton />);

  await userEvent.click(screen.getByRole('button'));

  expect(mockNavigate).toHaveBeenCalledWith('/login');
});

// -------------------------------------------------------------------------------------------
// 7. MOCKING CONTEXT
// -------------------------------------------------------------------------------------------

const mockUser = { id: 1, name: 'Test User' };

function renderWithAuth(ui, { user = null } = {}) {
  return render(
    <AuthContext.Provider value={{ user, isAuthenticated: !!user }}>
      {ui}
    </AuthContext.Provider>
  );
}

test('authenticated user', () => {
  renderWithAuth(<ProfilePage />, { user: mockUser });
  expect(screen.getByText('Test User')).toBeInTheDocument();
});

test('unauthenticated user', () => {
  renderWithAuth(<ProfilePage />);
  expect(screen.getByText(/please log in/i)).toBeInTheDocument();
});

// -------------------------------------------------------------------------------------------
// 8. SPYING
// -------------------------------------------------------------------------------------------

test('spy on method', () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

  render(<ComponentThatLogs />);

  expect(consoleSpy).toHaveBeenCalledWith('Component mounted');

  consoleSpy.mockRestore();
});

test('spy on object method', () => {
  const obj = { getValue: () => 42 };
  const spy = jest.spyOn(obj, 'getValue');

  obj.getValue();

  expect(spy).toHaveBeenCalled();
  expect(spy).toHaveReturnedWith(42);
});

// -------------------------------------------------------------------------------------------
// 9. MSW (MOCK SERVICE WORKER)
// -------------------------------------------------------------------------------------------

/**
 * MSW intercepts network requests at the network level.
 * More realistic than mocking fetch/axios.
 */

import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json([{ id: 1, name: 'John' }]));
  }),
  rest.post('/api/users', (req, res, ctx) => {
    return res(ctx.json({ id: 2, ...req.body }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('with MSW', async () => {
  render(<UserList />);

  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * MOCKING STRATEGIES:
 * 1. jest.fn() - Mock functions
 * 2. jest.mock() - Mock modules
 * 3. jest.spyOn() - Spy on methods
 * 4. MSW - Mock network requests
 *
 * BEST PRACTICES:
 * - Clear mocks between tests
 * - Mock at the right level
 * - Use MSW for integration tests
 * - Restore spies after tests
 * - Don't over-mock
 */
