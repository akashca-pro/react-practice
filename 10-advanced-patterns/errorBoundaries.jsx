/**
 * TOPIC: ERROR BOUNDARIES
 * DESCRIPTION:
 * Error boundaries catch JavaScript errors in their child component tree,
 * log the errors, and display a fallback UI. They prevent the entire app
 * from crashing due to errors in a part of the UI.
 */

import { Component, ErrorInfo, ReactNode } from 'react';

// -------------------------------------------------------------------------------------------
// 1. BASIC ERROR BOUNDARY
// -------------------------------------------------------------------------------------------

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state to show fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to service
    console.error('Error caught:', error);
    console.error('Component stack:', errorInfo.componentStack);
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <MyComponent />
    </ErrorBoundary>
  );
}

// -------------------------------------------------------------------------------------------
// 2. ERROR BOUNDARY WITH RESET
// -------------------------------------------------------------------------------------------

class ResettableErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallbackRender({
        error: this.state.error,
        resetErrorBoundary: this.resetErrorBoundary,
      });
    }
    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <ResettableErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div>
          <h2>Something went wrong</h2>
          <p>{error.message}</p>
          <button onClick={resetErrorBoundary}>Try Again</button>
        </div>
      )}
      onReset={() => {
        // Reset app state
      }}
    >
      <MyComponent />
    </ResettableErrorBoundary>
  );
}

// -------------------------------------------------------------------------------------------
// 3. REACT-ERROR-BOUNDARY LIBRARY
// -------------------------------------------------------------------------------------------

/**
 * npm install react-error-boundary
 * Provides a ready-to-use ErrorBoundary component.
 */

import { ErrorBoundary, useErrorHandler } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <h2>Something went wrong</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset app state
      }}
      onError={(error, info) => {
        // Log to error service
      }}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}

// -------------------------------------------------------------------------------------------
// 4. HANDLING ASYNC ERRORS
// -------------------------------------------------------------------------------------------

/**
 * Error boundaries don't catch async errors.
 * Use useErrorHandler hook to handle them.
 */

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const handleError = useErrorHandler();

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .catch(handleError); // Passes error to nearest boundary
  }, [userId, handleError]);

  return <div>{user?.name}</div>;
}

// Or with async/await
function DataLoader() {
  const handleError = useErrorHandler();

  const loadData = async () => {
    try {
      const data = await fetchData();
    } catch (error) {
      handleError(error);
    }
  };

  return <button onClick={loadData}>Load</button>;
}

// -------------------------------------------------------------------------------------------
// 5. GRANULAR ERROR BOUNDARIES
// -------------------------------------------------------------------------------------------

function App() {
  return (
    <div>
      {/* Main content - separate boundary */}
      <ErrorBoundary FallbackComponent={MainErrorFallback}>
        <Header />
        <MainContent />
      </ErrorBoundary>

      {/* Sidebar - separate boundary */}
      <ErrorBoundary FallbackComponent={SidebarErrorFallback}>
        <Sidebar />
      </ErrorBoundary>

      {/* Widgets - individual boundaries */}
      <div className="widgets">
        {widgets.map((widget) => (
          <ErrorBoundary key={widget.id} FallbackComponent={WidgetError}>
            <Widget {...widget} />
          </ErrorBoundary>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 6. ERROR BOUNDARY WITH KEYS
// -------------------------------------------------------------------------------------------

/**
 * Use key to reset error boundary when props change.
 */

function UserPage({ userId }) {
  return (
    <ErrorBoundary key={userId} FallbackComponent={ErrorFallback}>
      <UserProfile userId={userId} />
    </ErrorBoundary>
  );
}

// -------------------------------------------------------------------------------------------
// 7. WHAT ERROR BOUNDARIES DON'T CATCH
// -------------------------------------------------------------------------------------------

/**
 * Error boundaries DO NOT catch:
 * 1. Event handlers (use try/catch)
 * 2. Async code (setTimeout, promises)
 * 3. Server-side rendering
 * 4. Errors in the error boundary itself
 */

function Button() {
  const handleClick = () => {
    try {
      // Error boundaries won't catch this
      riskyOperation();
    } catch (error) {
      // Handle manually
      setState({ error });
    }
  };

  return <button onClick={handleClick}>Click</button>;
}

// -------------------------------------------------------------------------------------------
// 8. LOGGING ERRORS
// -------------------------------------------------------------------------------------------

class LoggingErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Send to error tracking service
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    });

    // Or custom logging
    fetch('/api/log-error', {
      method: 'POST',
      body: JSON.stringify({
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      }),
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Error boundaries are class components
 * 2. Use getDerivedStateFromError for fallback UI
 * 3. Use componentDidCatch for logging
 * 4. Don't catch event handler or async errors
 *
 * BEST PRACTICES:
 * - Place boundaries at strategic points
 * - Use granular boundaries for isolation
 * - Provide helpful fallback UIs
 * - Log errors to monitoring service
 * - Use react-error-boundary library
 * - Handle async errors with useErrorHandler
 */
