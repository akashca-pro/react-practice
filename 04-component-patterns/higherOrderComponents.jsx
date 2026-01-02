/**
 * TOPIC: HIGHER-ORDER COMPONENTS (HOC)
 * DESCRIPTION:
 * A HOC is a function that takes a component and returns a new component
 * with enhanced functionality. It's a pattern for reusing component logic.
 */

import { useState, useEffect, ComponentType } from 'react';

// -------------------------------------------------------------------------------------------
// 1. BASIC HOC
// -------------------------------------------------------------------------------------------

/**
 * HOC signature: (Component) => EnhancedComponent
 */

function withLogging(WrappedComponent) {
  return function WithLogging(props) {
    useEffect(() => {
      console.log(`${WrappedComponent.name} mounted`);
      return () => console.log(`${WrappedComponent.name} unmounted`);
    }, []);

    console.log(`${WrappedComponent.name} rendered with props:`, props);
    return <WrappedComponent {...props} />;
  };
}

// Usage
function MyComponent({ name }) {
  return <div>Hello, {name}</div>;
}

const MyComponentWithLogging = withLogging(MyComponent);

// -------------------------------------------------------------------------------------------
// 2. DATA FETCHING HOC
// -------------------------------------------------------------------------------------------

function withData(url) {
  return function(WrappedComponent) {
    return function WithData(props) {
      const [data, setData] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);

      useEffect(() => {
        fetch(url)
          .then((res) => res.json())
          .then((data) => { setData(data); setLoading(false); })
          .catch((err) => { setError(err); setLoading(false); });
      }, []);

      if (loading) return <div>Loading...</div>;
      if (error) return <div>Error: {error.message}</div>;

      return <WrappedComponent {...props} data={data} />;
    };
  };
}

// Usage
function UserList({ data }) {
  return <ul>{data.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}

const UserListWithData = withData('/api/users')(UserList);

// -------------------------------------------------------------------------------------------
// 3. AUTHENTICATION HOC
// -------------------------------------------------------------------------------------------

function withAuth(WrappedComponent) {
  return function WithAuth(props) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      checkAuth().then(setUser).finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Checking authentication...</div>;
    if (!user) return <Redirect to="/login" />;

    return <WrappedComponent {...props} user={user} />;
  };
}

// Usage
const ProtectedDashboard = withAuth(Dashboard);

// -------------------------------------------------------------------------------------------
// 4. THEMING HOC
// -------------------------------------------------------------------------------------------

const ThemeContext = React.createContext('light');

function withTheme(WrappedComponent) {
  return function WithTheme(props) {
    const theme = useContext(ThemeContext);
    return <WrappedComponent {...props} theme={theme} />;
  };
}

// Usage
function Button({ theme, children, ...props }) {
  return (
    <button className={`btn btn-${theme}`} {...props}>
      {children}
    </button>
  );
}

const ThemedButton = withTheme(Button);

// -------------------------------------------------------------------------------------------
// 5. HOC BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * 1. Pass through unrelated props
 * 2. Maximize composability
 * 3. Wrap display name for debugging
 * 4. Don't use inside render
 */

function withEnhancement(WrappedComponent) {
  function WithEnhancement(props) {
    const { extraProp, ...passThroughProps } = props;
    const injectedProp = computeInjectedProp(extraProp);

    return <WrappedComponent injectedProp={injectedProp} {...passThroughProps} />;
  }

  // Set display name for debugging
  WithEnhancement.displayName = `WithEnhancement(${getDisplayName(WrappedComponent)})`;

  return WithEnhancement;
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

// -------------------------------------------------------------------------------------------
// 6. COMPOSING HOCS
// -------------------------------------------------------------------------------------------

/**
 * Combine multiple HOCs using composition.
 */

// Manual composition
const EnhancedComponent = withAuth(withTheme(withLogging(MyComponent)));

// Using compose helper
function compose(...funcs) {
  return (arg) => funcs.reduceRight((acc, fn) => fn(acc), arg);
}

const enhance = compose(
  withAuth,
  withTheme,
  withLogging
);

const EnhancedComponent2 = enhance(MyComponent);

// -------------------------------------------------------------------------------------------
// 7. HOC VS HOOKS
// -------------------------------------------------------------------------------------------

/**
 * HOCs are largely replaced by hooks in modern React.
 * Hooks provide similar functionality with cleaner code.
 */

// HOC approach
const withWindowSize = (WrappedComponent) => {
  return function WithWindowSize(props) {
    const [size, setSize] = useState({ width: 0, height: 0 });
    // ... event listener logic
    return <WrappedComponent {...props} windowSize={size} />;
  };
};

// Hook approach (preferred)
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return size;
}

function ResponsiveComponent() {
  const size = useWindowSize();
  return <div>Width: {size.width}</div>;
}

// -------------------------------------------------------------------------------------------
// 8. CAVEATS
// -------------------------------------------------------------------------------------------

/**
 * HOC CAVEATS:
 * 1. Don't use inside render (creates new component each render)
 * 2. Static methods aren't copied (use hoist-non-react-statics)
 * 3. Refs aren't passed through (use React.forwardRef)
 * 4. Props naming collisions possible
 */

// BAD: HOC inside render
function Parent() {
  const Enhanced = withLogging(Child); // New on every render!
  return <Enhanced />;
}

// GOOD: HOC outside component
const EnhancedChild = withLogging(Child);
function Parent() {
  return <EnhancedChild />;
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. HOC takes component, returns enhanced component
 * 2. Used for cross-cutting concerns
 * 3. Can be composed together
 * 4. Largely replaced by hooks
 *
 * STILL USEFUL FOR:
 * - Class components
 * - Library patterns
 * - Wrapping third-party components
 *
 * BEST PRACTICES:
 * - Set displayName for debugging
 * - Pass through all props
 * - Don't mutate original component
 * - Create HOCs outside render
 */
