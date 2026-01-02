/**
 * TOPIC: INTEGRATION TESTING
 * DESCRIPTION:
 * Integration tests verify that multiple components work together correctly.
 * They test real user flows with minimal mocking for confidence in
 * production behavior.
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// -------------------------------------------------------------------------------------------
// 1. TEST SETUP
// -------------------------------------------------------------------------------------------

/**
 * Create wrapper with all providers for integration tests.
 */

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            {children}
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  };
}

function renderWithProviders(ui, options = {}) {
  return render(ui, { wrapper: createWrapper(), ...options });
}

// -------------------------------------------------------------------------------------------
// 2. MSW FOR API MOCKING
// -------------------------------------------------------------------------------------------

const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, name: 'John', email: 'john@example.com' },
      { id: 2, name: 'Jane', email: 'jane@example.com' },
    ]));
  }),

  rest.post('/api/users', async (req, res, ctx) => {
    const body = await req.json();
    return res(ctx.json({ id: 3, ...body }));
  }),

  rest.delete('/api/users/:id', (req, res, ctx) => {
    return res(ctx.status(204));
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// -------------------------------------------------------------------------------------------
// 3. USER FLOW TESTING
// -------------------------------------------------------------------------------------------

describe('User Management Flow', () => {
  test('user can view, add, and delete users', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserManagementPage />);

    // 1. View existing users
    expect(await screen.findByText('John')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();

    // 2. Add new user
    await user.click(screen.getByRole('button', { name: /add user/i }));

    const modal = screen.getByRole('dialog');
    await user.type(within(modal).getByLabelText(/name/i), 'Bob');
    await user.type(within(modal).getByLabelText(/email/i), 'bob@example.com');
    await user.click(within(modal).getByRole('button', { name: /save/i }));

    // New user appears in list
    expect(await screen.findByText('Bob')).toBeInTheDocument();

    // 3. Delete user
    const johnRow = screen.getByText('John').closest('tr');
    await user.click(within(johnRow).getByRole('button', { name: /delete/i }));
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(screen.queryByText('John')).not.toBeInTheDocument();
    });
  });
});

// -------------------------------------------------------------------------------------------
// 4. FORM SUBMISSION FLOW
// -------------------------------------------------------------------------------------------

describe('Contact Form', () => {
  test('submits form and shows success message', async () => {
    server.use(
      rest.post('/api/contact', (req, res, ctx) => {
        return res(ctx.json({ success: true }));
      })
    );

    const user = userEvent.setup();
    renderWithProviders(<ContactPage />);

    // Fill form
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/message/i), 'Hello there!');

    // Submit
    await user.click(screen.getByRole('button', { name: /send/i }));

    // Verify success
    expect(await screen.findByText(/message sent/i)).toBeInTheDocument();
  });

  test('shows validation errors', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ContactPage />);

    // Submit empty form
    await user.click(screen.getByRole('button', { name: /send/i }));

    // Check for errors
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  test('handles server error', async () => {
    server.use(
      rest.post('/api/contact', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );

    const user = userEvent.setup();
    renderWithProviders(<ContactPage />);

    await user.type(screen.getByLabelText(/name/i), 'John');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/message/i), 'Hello');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
  });
});

// -------------------------------------------------------------------------------------------
// 5. NAVIGATION FLOW
// -------------------------------------------------------------------------------------------

describe('Navigation', () => {
  test('navigates through app sections', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);

    // Start at home
    expect(screen.getByRole('heading', { name: /home/i })).toBeInTheDocument();

    // Navigate to products
    await user.click(screen.getByRole('link', { name: /products/i }));
    expect(await screen.findByRole('heading', { name: /products/i })).toBeInTheDocument();

    // Click on a product
    await user.click(screen.getByText('Product 1'));
    expect(await screen.findByRole('heading', { name: /product 1/i })).toBeInTheDocument();

    // Go back
    await user.click(screen.getByRole('link', { name: /back/i }));
    expect(await screen.findByRole('heading', { name: /products/i })).toBeInTheDocument();
  });
});

// -------------------------------------------------------------------------------------------
// 6. AUTHENTICATION FLOW
// -------------------------------------------------------------------------------------------

describe('Authentication', () => {
  test('logs in and accesses protected route', async () => {
    server.use(
      rest.post('/api/login', (req, res, ctx) => {
        return res(ctx.json({ user: { id: 1, name: 'John' }, token: 'abc123' }));
      }),
      rest.get('/api/profile', (req, res, ctx) => {
        const auth = req.headers.get('Authorization');
        if (auth === 'Bearer abc123') {
          return res(ctx.json({ id: 1, name: 'John', email: 'john@example.com' }));
        }
        return res(ctx.status(401));
      })
    );

    const user = userEvent.setup();
    renderWithProviders(<App />);

    // Try to access protected route
    await user.click(screen.getByRole('link', { name: /profile/i }));
    expect(await screen.findByRole('heading', { name: /login/i })).toBeInTheDocument();

    // Login
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Should redirect to profile
    expect(await screen.findByRole('heading', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});

// -------------------------------------------------------------------------------------------
// 7. FILTER AND SEARCH
// -------------------------------------------------------------------------------------------

describe('Product filtering', () => {
  test('filters products by category and search', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductsPage />);

    // Wait for products to load
    expect(await screen.findByText('Product 1')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(10);

    // Filter by category
    await user.selectOptions(screen.getByLabelText(/category/i), 'electronics');
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(5);
    });

    // Search
    await user.type(screen.getByPlaceholderText(/search/i), 'phone');
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    // Clear filters
    await user.click(screen.getByRole('button', { name: /clear/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(10);
    });
  });
});

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * INTEGRATION TEST PATTERNS:
 * 1. User flows (complete journeys)
 * 2. Form submissions
 * 3. Navigation
 * 4. Authentication
 * 5. Filtering/searching
 *
 * BEST PRACTICES:
 * - Use MSW for API mocking
 * - Create reusable render wrapper
 * - Test from user's perspective
 * - Use accessible queries (getByRole, getByLabelText)
 * - Test error states
 * - Use waitFor for async operations
 *
 * TOOLS:
 * - @testing-library/react
 * - @testing-library/user-event
 * - msw (Mock Service Worker)
 * - vitest or jest
 */
