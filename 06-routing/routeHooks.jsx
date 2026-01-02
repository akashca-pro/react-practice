/**
 * TOPIC: ROUTE HOOKS
 * DESCRIPTION:
 * React Router provides specialized hooks for accessing routing state,
 * navigation, and matching logic within components.
 */

import {
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
  useMatch,
  useMatches,
  useLoaderData,
  useActionData,
  useNavigation,
  useRouteError,
} from 'react-router-dom';

// -------------------------------------------------------------------------------------------
// 1. useNavigate
// -------------------------------------------------------------------------------------------

function NavigationExample() {
  const navigate = useNavigate();

  // Navigate to path
  const goHome = () => navigate('/');
  const goToUser = (id) => navigate(`/users/${id}`);

  // Navigate with options
  const login = () => navigate('/dashboard', { replace: true });

  // Navigate with state
  const checkout = () => navigate('/checkout', { state: { cart: items } });

  // Navigate back/forward
  const goBack = () => navigate(-1);
  const goForward = () => navigate(1);

  // Relative navigation
  const goToEdit = () => navigate('edit'); // Relative to current path
  const goUp = () => navigate('..'); // Parent route

  return (
    <div>
      <button onClick={goHome}>Home</button>
      <button onClick={goBack}>Back</button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 2. useParams
// -------------------------------------------------------------------------------------------

// Route: /users/:userId/posts/:postId
function PostDetail() {
  const { userId, postId } = useParams();

  return (
    <div>
      <p>User: {userId}</p>
      <p>Post: {postId}</p>
    </div>
  );
}

// With TypeScript
function UserProfile() {
  const { id } = useParams<{ id: string }>();
  return <div>User ID: {id}</div>;
}

// -------------------------------------------------------------------------------------------
// 3. useSearchParams
// -------------------------------------------------------------------------------------------

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get params
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const sort = searchParams.get('sort') || 'name';
  const categories = searchParams.getAll('category'); // Multiple values

  // Set single param
  const setPage = (p) => {
    searchParams.set('page', p.toString());
    setSearchParams(searchParams);
  };

  // Set multiple params
  const setFilters = (filters) => {
    setSearchParams({
      q: filters.query,
      page: filters.page.toString(),
      sort: filters.sort,
    });
  };

  // Delete param
  const clearSearch = () => {
    searchParams.delete('q');
    setSearchParams(searchParams);
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => {
          searchParams.set('q', e.target.value);
          searchParams.set('page', '1'); // Reset to page 1
          setSearchParams(searchParams);
        }}
      />
      <Pagination page={page} onPageChange={setPage} />
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 4. useLocation
// -------------------------------------------------------------------------------------------

function LocationInfo() {
  const location = useLocation();

  console.log({
    pathname: location.pathname,  // /users/123
    search: location.search,      // ?tab=profile
    hash: location.hash,          // #section-2
    state: location.state,        // Any passed state
    key: location.key,            // Unique key for this entry
  });

  // Access state from navigation
  const { from } = location.state || {};

  return <div>Current path: {location.pathname}</div>;
}

// Track page views
function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    analytics.trackPageView(location.pathname);
  }, [location]);

  return null;
}

// -------------------------------------------------------------------------------------------
// 5. useMatch
// -------------------------------------------------------------------------------------------

/**
 * Check if current URL matches a pattern.
 */

function NavItem({ to, children }) {
  const match = useMatch(to);
  const isActive = !!match;

  return (
    <Link to={to} className={isActive ? 'active' : ''}>
      {children}
    </Link>
  );
}

// Pattern matching
function UserSection() {
  const match = useMatch('/users/:userId/*');

  if (match) {
    console.log('User ID:', match.params.userId);
    console.log('Pattern matched:', match.pattern);
  }

  return <div>...</div>;
}

// -------------------------------------------------------------------------------------------
// 6. useMatches
// -------------------------------------------------------------------------------------------

/**
 * Get all matched routes (useful for breadcrumbs).
 */

function Breadcrumbs() {
  const matches = useMatches();

  // Filter routes with handle.crumb
  const crumbs = matches
    .filter((match) => match.handle?.crumb)
    .map((match) => match.handle.crumb(match.data));

  return (
    <nav>
      {crumbs.map((crumb, i) => (
        <span key={i}>
          {i > 0 && ' / '}
          {crumb}
        </span>
      ))}
    </nav>
  );
}

// Route config with handle
const routes = [
  {
    path: '/',
    element: <Layout />,
    handle: { crumb: () => 'Home' },
    children: [
      {
        path: 'products',
        element: <Products />,
        handle: { crumb: () => 'Products' },
      },
    ],
  },
];

// -------------------------------------------------------------------------------------------
// 7. DATA HOOKS (v6.4+)
// -------------------------------------------------------------------------------------------

/**
 * useLoaderData: Access data from route loader
 * useActionData: Access data from route action
 * useNavigation: Track navigation state
 */

// Route with loader
const userRoute = {
  path: 'user/:id',
  loader: async ({ params }) => {
    return fetch(`/api/users/${params.id}`);
  },
  element: <UserProfile />,
};

function UserProfile() {
  const user = useLoaderData(); // Data from loader
  const navigation = useNavigation(); // 'idle' | 'loading' | 'submitting'

  if (navigation.state === 'loading') {
    return <Loading />;
  }

  return <div>{user.name}</div>;
}

// Action data
function ContactForm() {
  const actionData = useActionData();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === 'submitting';

  return (
    <Form method="post">
      {actionData?.error && <p className="error">{actionData.error}</p>}
      <input name="message" />
      <button disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send'}
      </button>
    </Form>
  );
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * ESSENTIAL HOOKS:
 * - useNavigate: Programmatic navigation
 * - useParams: Route parameters
 * - useSearchParams: Query string params
 * - useLocation: Current location object
 *
 * MATCHING HOOKS:
 * - useMatch: Check if path matches
 * - useMatches: All matched routes
 *
 * DATA HOOKS (v6.4+):
 * - useLoaderData: Route loader data
 * - useActionData: Route action data
 * - useNavigation: Navigation state
 *
 * BEST PRACTICES:
 * - Use searchParams for filterable UI
 * - Use state for temporary navigation data
 * - Use loaders for data fetching
 */
