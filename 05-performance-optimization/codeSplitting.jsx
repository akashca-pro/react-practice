/**
 * TOPIC: CODE SPLITTING
 * DESCRIPTION:
 * Code splitting breaks your bundle into smaller chunks that load on demand.
 * React.lazy and Suspense enable component-level code splitting for
 * faster initial page loads.
 */

import { lazy, Suspense, useState, startTransition } from 'react';

// -------------------------------------------------------------------------------------------
// 1. REACT.LAZY BASICS
// -------------------------------------------------------------------------------------------

/**
 * lazy() creates a component that loads dynamically.
 * Must be used with Suspense for fallback UI.
 */

// Static import (bundled together)
// import HeavyComponent from './HeavyComponent';

// Dynamic import (separate chunk)
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}

// -------------------------------------------------------------------------------------------
// 2. ROUTE-BASED SPLITTING
// -------------------------------------------------------------------------------------------

/**
 * Split by route is the most common pattern.
 */

const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Suspense>
  );
}

// -------------------------------------------------------------------------------------------
// 3. NAMED EXPORTS
// -------------------------------------------------------------------------------------------

/**
 * lazy() only works with default exports.
 * Use this pattern for named exports.
 */

// Component has named export
// export const MyComponent = () => {...}

const MyComponent = lazy(() =>
  import('./MyComponent').then((module) => ({
    default: module.MyComponent,
  }))
);

// -------------------------------------------------------------------------------------------
// 4. PRELOADING COMPONENTS
// -------------------------------------------------------------------------------------------

/**
 * Preload components before they're needed.
 */

const Modal = lazy(() => import('./Modal'));

// Preload when user hovers
function Button() {
  const handleMouseEnter = () => {
    import('./Modal'); // Start loading immediately
  };

  return <button onMouseEnter={handleMouseEnter}>Open Modal</button>;
}

// Preload after initial render
function App() {
  useEffect(() => {
    // Preload after 2 seconds
    const timer = setTimeout(() => {
      import('./HeavyComponent');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return <div>App</div>;
}

// -------------------------------------------------------------------------------------------
// 5. ERROR BOUNDARIES WITH LAZY
// -------------------------------------------------------------------------------------------

/**
 * Handle loading failures with Error Boundaries.
 */

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Failed to load. <button onClick={() => window.location.reload()}>Retry</button></div>;
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <LazyComponent />
      </Suspense>
    </ErrorBoundary>
  );
}

// -------------------------------------------------------------------------------------------
// 6. CONDITIONAL LAZY LOADING
// -------------------------------------------------------------------------------------------

const AdminPanel = lazy(() => import('./AdminPanel'));
const UserPanel = lazy(() => import('./UserPanel'));

function Dashboard({ isAdmin }) {
  return (
    <Suspense fallback={<Loading />}>
      {isAdmin ? <AdminPanel /> : <UserPanel />}
    </Suspense>
  );
}

// -------------------------------------------------------------------------------------------
// 7. SUSPENSE WITH TRANSITIONS
// -------------------------------------------------------------------------------------------

/**
 * Use startTransition to avoid showing loading states immediately.
 */

function TabContainer() {
  const [tab, setTab] = useState('home');

  const handleTabChange = (newTab) => {
    startTransition(() => {
      setTab(newTab);
    });
  };

  return (
    <div>
      <TabButtons onTabChange={handleTabChange} />
      <Suspense fallback={<TabSkeleton />}>
        {tab === 'home' && <HomeTab />}
        {tab === 'settings' && <SettingsTab />}
      </Suspense>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 8. MULTIPLE SUSPENSE BOUNDARIES
// -------------------------------------------------------------------------------------------

function Layout() {
  return (
    <div>
      <Suspense fallback={<HeaderSkeleton />}>
        <LazyHeader />
      </Suspense>
      
      <main>
        <Suspense fallback={<ContentSkeleton />}>
          <LazyContent />
        </Suspense>
      </main>
      
      <Suspense fallback={<FooterSkeleton />}>
        <LazyFooter />
      </Suspense>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 9. WEBPACK MAGIC COMMENTS
// -------------------------------------------------------------------------------------------

/**
 * Control chunk naming and loading behavior.
 */

const Dashboard = lazy(() =>
  import(/* webpackChunkName: "dashboard" */ './Dashboard')
);

const Analytics = lazy(() =>
  import(
    /* webpackChunkName: "analytics" */
    /* webpackPrefetch: true */
    './Analytics'
  )
);

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. lazy() + Suspense for code splitting
 * 2. Split by routes for biggest impact
 * 3. Preload for better UX
 * 4. Handle errors with Error Boundaries
 *
 * BEST PRACTICES:
 * - Split at route level first
 * - Split large components/features
 * - Preload on user intent (hover, focus)
 * - Use meaningful chunk names
 * - Combine with Error Boundaries
 *
 * WHAT TO SPLIT:
 * - Route components
 * - Modals and dialogs
 * - Heavy libraries (charts, editors)
 * - Admin/premium features
 * - Below-the-fold content
 */
