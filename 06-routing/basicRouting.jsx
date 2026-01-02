/**
 * TOPIC: BASIC ROUTING
 * DESCRIPTION:
 * React Router is the standard routing library for React.
 * It enables navigation between views without page reloads.
 * npm install react-router-dom
 */

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

// -------------------------------------------------------------------------------------------
// 1. BASIC SETUP
// -------------------------------------------------------------------------------------------

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

// -------------------------------------------------------------------------------------------
// 2. LINK VS NAVLINK
// -------------------------------------------------------------------------------------------

/**
 * Link: Basic navigation
 * NavLink: Adds active state styling
 */

function Navigation() {
  return (
    <nav>
      {/* Basic link */}
      <Link to="/home">Home</Link>

      {/* Link with state */}
      <Link to="/profile" state={{ from: 'navigation' }}>
        Profile
      </Link>

      {/* NavLink with active styling */}
      <NavLink
        to="/dashboard"
        className={({ isActive }) => isActive ? 'active' : ''}
        style={({ isActive }) => ({ color: isActive ? 'red' : 'black' })}
      >
        Dashboard
      </NavLink>

      {/* NavLink end prop for exact matching */}
      <NavLink to="/" end>Home</NavLink>
    </nav>
  );
}

// -------------------------------------------------------------------------------------------
// 3. ROUTE PARAMETERS
// -------------------------------------------------------------------------------------------

import { useParams } from 'react-router-dom';

function AppWithParams() {
  return (
    <Routes>
      <Route path="/users/:userId" element={<UserProfile />} />
      <Route path="/posts/:postId/comments/:commentId" element={<Comment />} />
    </Routes>
  );
}

function UserProfile() {
  const { userId } = useParams();
  return <div>User ID: {userId}</div>;
}

function Comment() {
  const { postId, commentId } = useParams();
  return <div>Post: {postId}, Comment: {commentId}</div>;
}

// -------------------------------------------------------------------------------------------
// 4. PROGRAMMATIC NAVIGATION
// -------------------------------------------------------------------------------------------

function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login();

    // Navigate with options
    navigate('/dashboard', {
      replace: true,         // Replace current entry
      state: { from: location }, // Pass state
    });
  };

  // Go back
  const handleCancel = () => {
    navigate(-1); // Go back one step
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Login</button>
      <button type="button" onClick={handleCancel}>Cancel</button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 5. SEARCH PARAMS
// -------------------------------------------------------------------------------------------

import { useSearchParams } from 'react-router-dom';

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'name';
  const page = parseInt(searchParams.get('page') || '1');

  const updateFilters = (newFilters) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      ...newFilters,
    });
  };

  return (
    <div>
      <select
        value={category}
        onChange={(e) => updateFilters({ category: e.target.value })}
      >
        <option value="all">All</option>
        <option value="electronics">Electronics</option>
      </select>

      {/* URL: /products?category=electronics&sort=price&page=1 */}
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 6. LOCATION OBJECT
// -------------------------------------------------------------------------------------------

function LocationDemo() {
  const location = useLocation();

  console.log({
    pathname: location.pathname,  // /users/123
    search: location.search,      // ?tab=settings
    hash: location.hash,          // #section1
    state: location.state,        // { from: 'login' }
    key: location.key,            // Unique key
  });

  return <div>Current path: {location.pathname}</div>;
}

// -------------------------------------------------------------------------------------------
// 7. INDEX ROUTES
// -------------------------------------------------------------------------------------------

function AppWithIndex() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />      {/* Matches "/" */}
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
      </Route>
    </Routes>
  );
}

function Layout() {
  return (
    <div>
      <nav>...</nav>
      <main>
        <Outlet /> {/* Renders child route */}
      </main>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 8. ROUTER TYPES
// -------------------------------------------------------------------------------------------

import { HashRouter, MemoryRouter, StaticRouter } from 'react-router-dom';

/**
 * BrowserRouter: Uses HTML5 history API (recommended)
 * HashRouter: Uses URL hash (legacy, no server config needed)
 * MemoryRouter: In-memory (testing, React Native)
 * StaticRouter: Server-side rendering
 */

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. BrowserRouter wraps the app
 * 2. Routes defines route config
 * 3. Route matches path to element
 * 4. Link/NavLink for navigation
 *
 * BEST PRACTICES:
 * - Use NavLink for navigation menus
 * - Use relative paths when possible
 * - Handle 404 with catch-all route
 * - Use useNavigate for programmatic navigation
 * - Pass state through navigation when needed
 *
 * HOOKS:
 * - useNavigate: Programmatic navigation
 * - useParams: Route parameters
 * - useSearchParams: Query strings
 * - useLocation: Current location
 */
