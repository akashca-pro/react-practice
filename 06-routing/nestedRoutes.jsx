/**
 * TOPIC: NESTED ROUTES
 * DESCRIPTION:
 * Nested routes allow child routes to render inside parent layouts.
 * They enable complex UI structures with shared navigation and layouts.
 */

import { Routes, Route, Outlet, NavLink, useParams } from 'react-router-dom';

// -------------------------------------------------------------------------------------------
// 1. BASIC NESTED ROUTES
// -------------------------------------------------------------------------------------------

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        
        {/* Nested routes */}
        <Route path="users" element={<UsersLayout />}>
          <Route index element={<UsersList />} />
          <Route path=":userId" element={<UserDetail />} />
          <Route path=":userId/edit" element={<UserEdit />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

// -------------------------------------------------------------------------------------------
// 2. LAYOUT WITH OUTLET
// -------------------------------------------------------------------------------------------

/**
 * Outlet renders the matched child route.
 */

function Layout() {
  return (
    <div className="layout">
      <header>
        <nav>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/users">Users</NavLink>
        </nav>
      </header>
      
      <main>
        <Outlet /> {/* Child routes render here */}
      </main>
      
      <footer>© 2024</footer>
    </div>
  );
}

function UsersLayout() {
  return (
    <div className="users-layout">
      <aside>
        <nav>
          <NavLink to="/users" end>All Users</NavLink>
          <NavLink to="/users/new">New User</NavLink>
        </nav>
      </aside>
      
      <section>
        <Outlet /> {/* User child routes render here */}
      </section>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 3. OUTLET WITH CONTEXT
// -------------------------------------------------------------------------------------------

/**
 * Pass data to child routes via Outlet context.
 */

function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser().then(setUser);
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <Outlet context={{ user, setUser }} />
    </div>
  );
}

// Access context in child route
import { useOutletContext } from 'react-router-dom';

function DashboardProfile() {
  const { user, setUser } = useOutletContext();
  return <div>Welcome, {user?.name}</div>;
}

// -------------------------------------------------------------------------------------------
// 4. RELATIVE PATHS
// -------------------------------------------------------------------------------------------

/**
 * Use relative paths in nested routes.
 */

function UserDetail() {
  const { userId } = useParams();

  return (
    <div>
      <h2>User {userId}</h2>
      
      {/* Relative links - relative to current route */}
      <NavLink to="edit">Edit</NavLink>        {/* /users/:userId/edit */}
      <NavLink to="settings">Settings</NavLink> {/* /users/:userId/settings */}
      <NavLink to="..">Back to Users</NavLink>  {/* /users */}
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 5. INDEX ROUTES
// -------------------------------------------------------------------------------------------

/**
 * Index routes render when parent path matches exactly.
 */

function AppWithIndex() {
  return (
    <Routes>
      <Route path="products" element={<ProductsLayout />}>
        <Route index element={<ProductsList />} />     {/* /products */}
        <Route path=":id" element={<ProductDetail />} /> {/* /products/:id */}
      </Route>
    </Routes>
  );
}

// -------------------------------------------------------------------------------------------
// 6. PATHLESS ROUTES (LAYOUT ROUTES)
// -------------------------------------------------------------------------------------------

/**
 * Routes without path are used for shared layouts.
 */

function AppWithLayouts() {
  return (
    <Routes>
      {/* Public layout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="about" element={<About />} />
      </Route>

      {/* Auth layout */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      {/* Dashboard layout */}
      <Route element={<DashboardLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

// -------------------------------------------------------------------------------------------
// 7. DESCENDENT ROUTES
// -------------------------------------------------------------------------------------------

/**
 * Define routes in child components with trailing *.
 */

function App() {
  return (
    <Routes>
      <Route path="admin/*" element={<AdminSection />} />
    </Routes>
  );
}

function AdminSection() {
  return (
    <div>
      <h1>Admin</h1>
      {/* These routes are relative to /admin */}
      <Routes>
        <Route index element={<AdminHome />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="settings" element={<AdminSettings />} />
      </Routes>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 8. DYNAMIC NESTED ROUTES
// -------------------------------------------------------------------------------------------

function BlogRoutes() {
  return (
    <Routes>
      <Route path="blog" element={<BlogLayout />}>
        <Route index element={<BlogList />} />
        <Route path=":slug" element={<BlogPost />}>
          <Route index element={<Comments />} />
          <Route path="related" element={<RelatedPosts />} />
        </Route>
        <Route path="category/:category" element={<CategoryPosts />} />
      </Route>
    </Routes>
  );
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Outlet renders matched child routes
 * 2. Index routes for default content
 * 3. Relative paths for nested navigation
 * 4. Pathless routes for shared layouts
 *
 * BEST PRACTICES:
 * - Use layouts to share UI structure
 * - Use relative links within nested routes
 * - Pass data via Outlet context
 * - Use index routes for defaults
 * - Keep route structure flat when possible
 */
