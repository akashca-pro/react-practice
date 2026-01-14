/**
 * TOPIC: DATA ROUTING (React Router v6.4+)
 * DESCRIPTION:
 * React Router v6.4 introduced a new data-driven approach to routing.
 * It enables loading data before rendering, form handling with actions,
 * pending UI states, and error boundaries at the route level.
 * 
 * KEY FEATURES:
 * - createBrowserRouter: New router creation API
 * - Loaders: Fetch data before route renders
 * - Actions: Handle form submissions and mutations
 * - Error boundaries: Handle errors at route level
 * - Deferred data: Stream data for better UX
 */

import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Form,
  Link,
  NavLink,
  Outlet,
  useLoaderData,
  useActionData,
  useNavigation,
  useNavigate,
  useSubmit,
  useFetcher,
  useFetchers,
  useRouteError,
  useRouteLoaderData,
  useRevalidator,
  redirect,
  json,
  defer,
  Await,
} from 'react-router-dom';
import { Suspense } from 'react';

// -------------------------------------------------------------------------------------------
// 1. CREATING A DATA ROUTER
// -------------------------------------------------------------------------------------------

/**
 * createBrowserRouter replaces BrowserRouter for data routing.
 * It enables loaders, actions, and error handling.
 */

// Method 1: Route objects
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RootError />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'users',
        element: <UsersLayout />,
        loader: usersLoader,
        children: [
          { index: true, element: <UsersList />, loader: usersListLoader },
          { path: ':userId', element: <UserDetail />, loader: userLoader },
          { path: ':userId/edit', element: <UserEdit />, action: userEditAction },
        ],
      },
    ],
  },
]);

// Method 2: JSX routes with createRoutesFromElements
const routerJSX = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />} errorElement={<RootError />}>
      <Route index element={<Home />} />
      <Route path="users" element={<UsersLayout />} loader={usersLoader}>
        <Route index element={<UsersList />} loader={usersListLoader} />
        <Route path=":userId" element={<UserDetail />} loader={userLoader} />
        <Route path=":userId/edit" element={<UserEdit />} action={userEditAction} />
      </Route>
    </Route>
  )
);

// App with RouterProvider
function App() {
  return <RouterProvider router={router} />;
}

// -------------------------------------------------------------------------------------------
// 2. LOADERS - DATA FETCHING
// -------------------------------------------------------------------------------------------

/**
 * Loaders fetch data before a route renders.
 * They run in parallel for nested routes.
 * 
 * Loader receives:
 * - params: Route parameters
 * - request: Fetch Request object
 */

// Basic loader
async function usersLoader() {
  const response = await fetch('/api/users');
  if (!response.ok) {
    throw new Response('Failed to fetch users', { status: response.status });
  }
  return response.json();
}

// Loader with params
async function userLoader({ params }) {
  const response = await fetch(`/api/users/${params.userId}`);
  if (!response.ok) {
    throw new Response('User not found', { status: 404 });
  }
  return response.json();
}

// Loader with request (for search params)
async function searchLoader({ request }) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  const page = url.searchParams.get('page') || '1';
  
  const response = await fetch(`/api/search?q=${query}&page=${page}`);
  return response.json();
}

// Using loader data in component
function UsersList() {
  const users = useLoaderData();
  
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>
          <Link to={`${user.id}`}>{user.name}</Link>
        </li>
      ))}
    </ul>
  );
}

// -------------------------------------------------------------------------------------------
// 3. ACTIONS - FORM HANDLING
// -------------------------------------------------------------------------------------------

/**
 * Actions handle form submissions and mutations.
 * They run when a form is submitted to that route.
 * 
 * Action receives:
 * - params: Route parameters
 * - request: Fetch Request with form data
 */

// Create action
async function createUserAction({ request }) {
  const formData = await request.formData();
  const userData = {
    name: formData.get('name'),
    email: formData.get('email'),
  };
  
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    // Return validation errors
    return json({ error: 'Failed to create user' }, { status: 400 });
  }
  
  // Redirect on success
  return redirect('/users');
}

// Update action
async function userEditAction({ params, request }) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  
  await fetch(`/api/users/${params.userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  
  return redirect(`/users/${params.userId}`);
}

// Delete action (method check)
async function userAction({ params, request }) {
  if (request.method === 'DELETE') {
    await fetch(`/api/users/${params.userId}`, { method: 'DELETE' });
    return redirect('/users');
  }
  
  // Handle other methods...
}

// -------------------------------------------------------------------------------------------
// 4. FORM COMPONENT
// -------------------------------------------------------------------------------------------

/**
 * Form component replaces HTML form for data router integration.
 * It handles form serialization and triggers actions.
 */

// Basic form
function CreateUserForm() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  return (
    <Form method="post">
      {actionData?.error && <p className="error">{actionData.error}</p>}
      
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create User'}
      </button>
    </Form>
  );
}

// Form with different methods
function UserActions({ userId }) {
  return (
    <div>
      {/* POST - Create/Update */}
      <Form method="post">
        <input name="action" value="update" hidden />
        <button type="submit">Update</button>
      </Form>
      
      {/* DELETE */}
      <Form method="delete" action={`/users/${userId}`}>
        <button type="submit">Delete</button>
      </Form>
      
      {/* Navigate to another route for action */}
      <Form method="post" action="/logout">
        <button type="submit">Logout</button>
      </Form>
    </div>
  );
}

// Form replacing navigation behavior
function SearchForm() {
  return (
    <Form method="get" action="/search">
      <input name="q" placeholder="Search..." />
      <button type="submit">Search</button>
    </Form>
  );
}

// -------------------------------------------------------------------------------------------
// 5. NAVIGATION STATE
// -------------------------------------------------------------------------------------------

/**
 * useNavigation provides navigation state for pending UI.
 * States: 'idle' | 'loading' | 'submitting'
 */

function GlobalLoadingIndicator() {
  const navigation = useNavigation();
  
  // Loading a new route
  if (navigation.state === 'loading') {
    return <div className="loading-bar" />;
  }
  
  // Submitting a form
  if (navigation.state === 'submitting') {
    return <div className="spinner" />;
  }
  
  return null;
}

function DetailedNavigation() {
  const navigation = useNavigation();
  
  console.log({
    state: navigation.state,         // 'idle' | 'loading' | 'submitting'
    location: navigation.location,   // Location being navigated to
    formAction: navigation.formAction, // Action URL
    formMethod: navigation.formMethod, // 'GET' | 'POST' | 'PUT' | 'DELETE'
    formData: navigation.formData,   // FormData being submitted
  });
  
  // Check if navigating to specific page
  const isNavigatingToUsers = 
    navigation.state === 'loading' && 
    navigation.location?.pathname.startsWith('/users');
  
  return (
    <nav>
      <NavLink 
        to="/users"
        className={isNavigatingToUsers ? 'loading' : ''}
      >
        Users
      </NavLink>
    </nav>
  );
}

// -------------------------------------------------------------------------------------------
// 6. ERROR HANDLING
// -------------------------------------------------------------------------------------------

/**
 * Error boundaries catch errors in loaders, actions, and rendering.
 * useRouteError accesses the error that was thrown.
 */

// Error element
function RootError() {
  const error = useRouteError();
  
  // Handle different error types
  if (error.status === 404) {
    return <NotFoundPage />;
  }
  
  if (error.status === 401) {
    return <UnauthorizedPage />;
  }
  
  return (
    <div className="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error occurred.</p>
      <p>{error.statusText || error.message}</p>
    </div>
  );
}

// Throwing errors in loaders
async function protectedLoader({ request }) {
  const user = await getUser();
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }
  
  // Or throw redirect
  if (!user) {
    throw redirect('/login');
  }
  
  return user;
}

// Error boundary at nested level
const routesWithErrors = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RootError />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'users',
        element: <UsersLayout />,
        errorElement: <UsersError />, // Catches errors only in /users/*
        children: [
          { index: true, element: <UsersList />, loader: usersLoader },
        ],
      },
    ],
  },
];

// -------------------------------------------------------------------------------------------
// 7. FETCHER - NON-NAVIGATION DATA
// -------------------------------------------------------------------------------------------

/**
 * useFetcher fetches data without navigation.
 * Perfect for:
 * - In-place updates
 * - Background saves
 * - Loading data for UI pieces
 */

function NewsletterSignup() {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === 'submitting';
  
  return (
    <fetcher.Form method="post" action="/api/newsletter">
      <input name="email" type="email" placeholder="Enter email" />
      <button disabled={isSubmitting}>
        {isSubmitting ? 'Subscribing...' : 'Subscribe'}
      </button>
      
      {fetcher.data?.success && <p>Thanks for subscribing!</p>}
      {fetcher.data?.error && <p className="error">{fetcher.data.error}</p>}
    </fetcher.Form>
  );
}

// Fetcher for loading data
function UserCard({ userId }) {
  const fetcher = useFetcher();
  
  useEffect(() => {
    if (fetcher.state === 'idle' && !fetcher.data) {
      fetcher.load(`/api/users/${userId}`);
    }
  }, [fetcher, userId]);
  
  if (!fetcher.data) {
    return <div>Loading...</div>;
  }
  
  return <div>{fetcher.data.name}</div>;
}

// Fetcher for optimistic updates
function LikeButton({ postId, initialLikes }) {
  const fetcher = useFetcher();
  
  // Use optimistic value while submitting
  const likes = fetcher.formData
    ? parseInt(fetcher.formData.get('likes')) + 1
    : initialLikes;
  
  return (
    <fetcher.Form method="post" action={`/posts/${postId}/like`}>
      <input name="likes" value={initialLikes} hidden />
      <button type="submit">
        ❤️ {likes}
      </button>
    </fetcher.Form>
  );
}

// useFetchers - get all active fetchers
function ActiveOperations() {
  const fetchers = useFetchers();
  
  const submittingCount = fetchers.filter(
    (f) => f.state === 'submitting'
  ).length;
  
  return <p>{submittingCount} operations in progress</p>;
}

// -------------------------------------------------------------------------------------------
// 8. DEFERRED DATA & STREAMING
// -------------------------------------------------------------------------------------------

/**
 * defer() allows streaming data for faster initial render.
 * Use Await component to handle deferred data.
 */

// Loader with defer
async function dashboardLoader() {
  return defer({
    // Critical data (awaited)
    user: await getUser(),
    // Non-critical data (streamed)
    stats: getStats(), // Note: no await
    notifications: getNotifications(),
  });
}

function Dashboard() {
  const { user, stats, notifications } = useLoaderData();
  
  return (
    <div>
      {/* Critical data rendered immediately */}
      <h1>Welcome, {user.name}</h1>
      
      {/* Deferred data with Suspense */}
      <Suspense fallback={<StatsLoading />}>
        <Await 
          resolve={stats} 
          errorElement={<StatsError />}
        >
          {(resolvedStats) => <Stats data={resolvedStats} />}
        </Await>
      </Suspense>
      
      <Suspense fallback={<NotificationsLoading />}>
        <Await resolve={notifications}>
          {(resolvedNotifications) => (
            <Notifications items={resolvedNotifications} />
          )}
        </Await>
      </Suspense>
    </div>
  );
}

// Await with render prop pattern
function DeferredSection() {
  const { products } = useLoaderData();
  
  return (
    <Suspense fallback={<p>Loading products...</p>}>
      <Await
        resolve={products}
        errorElement={<p>Error loading products</p>}
      >
        {(products) => (
          <ul>
            {products.map((p) => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
        )}
      </Await>
    </Suspense>
  );
}

// -------------------------------------------------------------------------------------------
// 9. REVALIDATION
// -------------------------------------------------------------------------------------------

/**
 * useRevalidator manually triggers data revalidation.
 * Loaders automatically revalidate after actions.
 */

function DataRefreshButton() {
  const revalidator = useRevalidator();
  
  return (
    <button
      onClick={() => revalidator.revalidate()}
      disabled={revalidator.state === 'loading'}
    >
      {revalidator.state === 'loading' ? 'Refreshing...' : 'Refresh Data'}
    </button>
  );
}

// Access parent route's loader data
function NestedComponent() {
  // Get data from any route in the tree
  const rootData = useRouteLoaderData('root');
  const usersData = useRouteLoaderData('users');
  
  return <div>User count: {usersData?.users.length}</div>;
}

// Routes with IDs for useRouteLoaderData
const routesWithIds = [
  {
    id: 'root',
    path: '/',
    element: <RootLayout />,
    loader: rootLoader,
    children: [
      {
        id: 'users',
        path: 'users',
        element: <UsersLayout />,
        loader: usersLoader,
      },
    ],
  },
];

// -------------------------------------------------------------------------------------------
// 10. useSubmit - PROGRAMMATIC FORM SUBMISSION
// -------------------------------------------------------------------------------------------

/**
 * useSubmit programmatically submits forms.
 * Useful for debounced inputs, auto-saves, etc.
 */

function SearchWithDebounce() {
  const submit = useSubmit();
  const [query, setQuery] = useState('');
  
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        submit({ q: query }, { method: 'get', action: '/search' });
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query, submit]);
  
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}

// Submit with form data
function AutoSaveForm() {
  const submit = useSubmit();
  const formRef = useRef(null);
  
  const handleAutoSave = () => {
    submit(formRef.current, { method: 'post' });
  };
  
  return (
    <Form ref={formRef} method="post">
      <textarea name="content" onBlur={handleAutoSave} />
    </Form>
  );
}

// Submit with different data types
function ProgrammaticSubmit() {
  const submit = useSubmit();
  const navigate = useNavigate();
  
  const deleteItem = (id) => {
    // FormData
    const formData = new FormData();
    formData.append('id', id);
    submit(formData, { method: 'delete' });
    
    // Plain object
    submit({ id }, { method: 'delete', action: '/items' });
    
    // URLSearchParams
    submit(new URLSearchParams({ q: 'search' }), { method: 'get' });
  };
  
  return <button onClick={() => deleteItem(123)}>Delete</button>;
}

// -------------------------------------------------------------------------------------------
// 11. ROUTE HANDLES - METADATA
// -------------------------------------------------------------------------------------------

/**
 * Route handles store custom metadata accessible via useMatches.
 * Perfect for breadcrumbs, titles, permissions.
 */

const routesWithHandles = [
  {
    path: '/',
    element: <RootLayout />,
    handle: {
      crumb: () => <Link to="/">Home</Link>,
    },
    children: [
      {
        path: 'products',
        element: <ProductsLayout />,
        handle: {
          crumb: () => <Link to="/products">Products</Link>,
        },
        children: [
          {
            path: ':id',
            element: <ProductDetail />,
            loader: productLoader,
            handle: {
              crumb: (data) => <span>{data.product.name}</span>,
            },
          },
        ],
      },
    ],
  },
];

function Breadcrumbs() {
  const matches = useMatches();
  
  const crumbs = matches
    .filter((m) => m.handle?.crumb)
    .map((m) => m.handle.crumb(m.data));
  
  return (
    <nav>
      {crumbs.map((crumb, i) => (
        <span key={i}>
          {i > 0 && ' › '}
          {crumb}
        </span>
      ))}
    </nav>
  );
}

// -------------------------------------------------------------------------------------------
// 12. LAZY LOADING ROUTES
// -------------------------------------------------------------------------------------------

/**
 * lazy() enables code splitting at the route level.
 * The entire route (element, loader, action) can be lazy loaded.
 */

const lazyRoutes = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'dashboard',
        lazy: () => import('./routes/Dashboard'),
        // Dashboard.jsx exports: Component, loader, action
      },
      {
        path: 'settings',
        lazy: async () => {
          const module = await import('./routes/Settings');
          return {
            element: <module.default />,
            loader: module.settingsLoader,
            action: module.settingsAction,
          };
        },
      },
    ],
  },
];

// Dashboard.jsx
export const Component = function Dashboard() {
  const data = useLoaderData();
  return <div>Dashboard</div>;
};

export async function loader() {
  return fetch('/api/dashboard');
}

export async function action({ request }) {
  // Handle action
}

// -------------------------------------------------------------------------------------------
// 13. SCROLL RESTORATION
// -------------------------------------------------------------------------------------------

import { ScrollRestoration } from 'react-router-dom';

function RootLayout() {
  return (
    <>
      <header>...</header>
      <main>
        <Outlet />
      </main>
      {/* Automatically restores scroll position */}
      <ScrollRestoration />
    </>
  );
}

// Custom scroll restoration
function CustomScrollRestoration() {
  return (
    <ScrollRestoration
      getKey={(location, matches) => {
        // Restore based on pathname (default: location.key)
        return location.pathname;
      }}
    />
  );
}

// -------------------------------------------------------------------------------------------
// 14. COMPLETE EXAMPLE - CRUD APPLICATION
// -------------------------------------------------------------------------------------------

// Route configuration
const crudRouter = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'contacts',
        element: <ContactsLayout />,
        loader: contactsLoader,
        children: [
          { index: true, element: <ContactsIndex /> },
          { path: 'new', element: <NewContact />, action: createContactAction },
          {
            path: ':contactId',
            element: <ContactDetail />,
            loader: contactDetailLoader,
            action: contactAction,
            errorElement: <ContactError />,
          },
          {
            path: ':contactId/edit',
            element: <EditContact />,
            loader: contactDetailLoader,
            action: editContactAction,
          },
        ],
      },
    ],
  },
]);

// Loaders
async function contactsLoader() {
  const response = await fetch('/api/contacts');
  return response.json();
}

async function contactDetailLoader({ params }) {
  const response = await fetch(`/api/contacts/${params.contactId}`);
  if (!response.ok) throw new Response('Not Found', { status: 404 });
  return response.json();
}

// Actions
async function createContactAction({ request }) {
  const formData = await request.formData();
  const contact = await createContact(Object.fromEntries(formData));
  return redirect(`/contacts/${contact.id}`);
}

async function contactAction({ request, params }) {
  const formData = await request.formData();
  const intent = formData.get('intent');
  
  if (intent === 'favorite') {
    await updateContact(params.contactId, { favorite: true });
    return { ok: true };
  }
  
  if (request.method === 'DELETE') {
    await deleteContact(params.contactId);
    return redirect('/contacts');
  }
}

async function editContactAction({ request, params }) {
  const formData = await request.formData();
  await updateContact(params.contactId, Object.fromEntries(formData));
  return redirect(`/contacts/${params.contactId}`);
}

// Components
function ContactsLayout() {
  const contacts = useLoaderData();
  const navigation = useNavigation();
  
  return (
    <div className="contacts-layout">
      <aside className={navigation.state === 'loading' ? 'loading' : ''}>
        <Link to="new">New Contact</Link>
        <ul>
          {contacts.map((c) => (
            <li key={c.id}>
              <NavLink to={`${c.id}`}>{c.name}</NavLink>
            </li>
          ))}
        </ul>
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

function ContactDetail() {
  const contact = useLoaderData();
  const fetcher = useFetcher();
  
  return (
    <div>
      <h2>{contact.name}</h2>
      <p>{contact.email}</p>
      
      <fetcher.Form method="post">
        <button name="intent" value="favorite">
          {contact.favorite ? '★' : '☆'}
        </button>
      </fetcher.Form>
      
      <div>
        <Link to="edit">Edit</Link>
        <Form method="delete">
          <button type="submit">Delete</button>
        </Form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY CONCEPTS:
 * 1. createBrowserRouter - Enable data routing
 * 2. Loaders - Fetch data before render
 * 3. Actions - Handle mutations
 * 4. Form - Submit data to actions
 * 5. useFetcher - Non-navigation data ops
 *
 * DATA HOOKS:
 * - useLoaderData: Route's loader data
 * - useActionData: Route's action response
 * - useNavigation: Navigation/submission state
 * - useRouteError: Caught error
 * - useRevalidator: Manual revalidation
 * - useRouteLoaderData: Parent route's data
 *
 * BEST PRACTICES:
 * - Colocate loaders/actions with routes
 * - Use defer() for non-critical data
 * - Handle errors at appropriate level
 * - Use fetcher for in-place updates
 * - Use handles for route metadata
 * - Implement optimistic UI with fetcher
 *
 * MIGRATION FROM useEffect:
 * Before (useEffect):
 *   useEffect(() => { fetchData() }, [])
 *
 * After (loader):
 *   loader: async () => fetchData()
 *   const data = useLoaderData()
 *
 * BENEFITS:
 * - Data loads before render (no loading flash)
 * - Parallel data fetching
 * - Automatic revalidation after mutations
 * - Built-in pending UI states
 * - Better error handling
 */
