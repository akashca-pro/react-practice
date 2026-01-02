/**
 * TOPIC: PROTECTED ROUTES
 * DESCRIPTION:
 * Protected routes restrict access to authenticated users.
 * They redirect unauthenticated users to login.
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './authContext';

// -------------------------------------------------------------------------------------------
// 1. BASIC PROTECTED ROUTE
// -------------------------------------------------------------------------------------------

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login, save current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Usage in routes
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/public" element={<PublicPage />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

// -------------------------------------------------------------------------------------------
// 2. PROTECTED ROUTE LAYOUT
// -------------------------------------------------------------------------------------------

/**
 * Wrap multiple routes with one protection check.
 */

function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* All these routes are protected */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

// -------------------------------------------------------------------------------------------
// 3. ROLE-BASED PROTECTION
// -------------------------------------------------------------------------------------------

function RoleProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Usage
<Route
  path="/admin"
  element={
    <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
      <AdminPanel />
    </RoleProtectedRoute>
  }
/>

// -------------------------------------------------------------------------------------------
// 4. REDIRECT AFTER LOGIN
// -------------------------------------------------------------------------------------------

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(credentials);
    navigate(from, { replace: true }); // Redirect to original destination
  };

  return <form onSubmit={handleSubmit}>...</form>;
}

// -------------------------------------------------------------------------------------------
// 5. AUTH CONTEXT EXAMPLE
// -------------------------------------------------------------------------------------------

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth status on mount
    checkAuthStatus()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const user = await loginAPI(credentials);
    setUser(user);
  };

  const logout = async () => {
    await logoutAPI();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  return useContext(AuthContext);
}

// -------------------------------------------------------------------------------------------
// 6. PERMISSION-BASED ACCESS
// -------------------------------------------------------------------------------------------

function PermissionRoute({ children, permission }) {
  const { user } = useAuth();

  const hasPermission = user?.permissions?.includes(permission);

  if (!hasPermission) {
    return <AccessDenied />;
  }

  return children;
}

// Usage
<PermissionRoute permission="edit:posts">
  <PostEditor />
</PermissionRoute>

// -------------------------------------------------------------------------------------------
// 7. REQUIRE AUTH HOOK
// -------------------------------------------------------------------------------------------

function useRequireAuth(redirectUrl = '/login') {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate(redirectUrl, { state: { from: location }, replace: true });
    }
  }, [isAuthenticated, loading, navigate, redirectUrl, location]);

  return { isAuthenticated, loading };
}

// Usage in component
function Dashboard() {
  const { loading } = useRequireAuth();

  if (loading) return <Loading />;
  return <div>Dashboard content</div>;
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Redirect unauthenticated users to login
 * 2. Save original location for redirect after login
 * 3. Use layout routes for multiple protected routes
 * 4. Support role/permission-based access
 *
 * BEST PRACTICES:
 * - Show loading state while checking auth
 * - Preserve original destination
 * - Use replace to avoid back-button issues
 * - Handle different roles/permissions
 * - Keep auth state in context
 */
