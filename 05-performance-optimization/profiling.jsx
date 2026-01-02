/**
 * TOPIC: PROFILING
 * DESCRIPTION:
 * React DevTools Profiler helps identify performance bottlenecks.
 * Learn to profile, identify slow components, and measure improvements.
 */

import { Profiler, memo, useMemo, useCallback } from 'react';

// -------------------------------------------------------------------------------------------
// 1. REACT DEVTOOLS PROFILER
// -------------------------------------------------------------------------------------------

/**
 * HOW TO USE:
 * 1. Install React DevTools browser extension
 * 2. Open DevTools → Profiler tab
 * 3. Click "Record" button
 * 4. Interact with your app
 * 5. Stop recording
 * 6. Analyze the flame graph
 */

/**
 * WHAT TO LOOK FOR:
 * - Long bars (slow renders)
 * - Frequent re-renders
 * - Components rendering unnecessarily
 * - "Why did this render?" feature
 */

// -------------------------------------------------------------------------------------------
// 2. PROFILER COMPONENT API
// -------------------------------------------------------------------------------------------

/**
 * Programmatically measure render performance.
 */

function onRenderCallback(
  id,           // Profiler id
  phase,        // "mount" | "update"
  actualDuration,   // Time spent rendering
  baseDuration,     // Time without memoization
  startTime,        // When render started
  commitTime,       // When React committed
  interactions      // Set of interactions
) {
  console.log({
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
  });

  // Send to analytics
  if (actualDuration > 16) { // Longer than 1 frame
    logSlowRender({ id, phase, actualDuration });
  }
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Header />
      <MainContent />
      <Footer />
    </Profiler>
  );
}

// Nested profilers for granular measurement
function Dashboard() {
  return (
    <div>
      <Profiler id="Sidebar" onRender={onRenderCallback}>
        <Sidebar />
      </Profiler>
      <Profiler id="MainPanel" onRender={onRenderCallback}>
        <MainPanel />
      </Profiler>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 3. PERFORMANCE MEASUREMENT
// -------------------------------------------------------------------------------------------

/**
 * Use browser Performance API for detailed timing.
 */

function measureRender() {
  performance.mark('render-start');

  // ... render logic

  performance.mark('render-end');
  performance.measure('render', 'render-start', 'render-end');

  const measure = performance.getEntriesByName('render')[0];
  console.log(`Render took ${measure.duration}ms`);
}

// Custom hook for measuring
function useMeasure(name) {
  useEffect(() => {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      console.log(`${name}: ${duration.toFixed(2)}ms`);
    };
  }, [name]);
}

// -------------------------------------------------------------------------------------------
// 4. IDENTIFYING SLOW RENDERS
// -------------------------------------------------------------------------------------------

/**
 * Common causes of slow renders:
 * 1. Rendering large lists without virtualization
 * 2. Expensive calculations during render
 * 3. Unnecessary re-renders
 * 4. Heavy component trees
 */

// Add render logging during development
function SlowComponent({ data }) {
  console.time('SlowComponent render');

  // ... rendering logic

  console.timeEnd('SlowComponent render');
  return <div>...</div>;
}

// Count renders
function useRenderCount() {
  const renderCount = useRef(0);
  renderCount.current += 1;

  useEffect(() => {
    console.log(`Rendered ${renderCount.current} times`);
  });

  return renderCount.current;
}

// -------------------------------------------------------------------------------------------
// 5. WHY DID THIS RENDER
// -------------------------------------------------------------------------------------------

/**
 * npm install @welldone-software/why-did-you-render
 * Tracks and logs unnecessary re-renders.
 */

// Setup in app entry point
import React from 'react';
import whyDidYouRender from '@welldone-software/why-did-you-render';

if (process.env.NODE_ENV === 'development') {
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}

// Track specific component
function MyComponent(props) {
  return <div>{props.value}</div>;
}
MyComponent.whyDidYouRender = true;

// -------------------------------------------------------------------------------------------
// 6. OPTIMIZATION WORKFLOW
// -------------------------------------------------------------------------------------------

/**
 * STEP-BY-STEP OPTIMIZATION:
 * 
 * 1. PROFILE: Identify slow components with DevTools
 * 
 * 2. ANALYZE: Determine why it's slow
 *    - Too many items rendered?
 *    - Expensive calculations?
 *    - Unnecessary re-renders?
 * 
 * 3. OPTIMIZE: Apply appropriate technique
 *    - React.memo for pure components
 *    - useMemo for expensive calculations
 *    - useCallback for stable functions
 *    - Virtualization for long lists
 *    - Code splitting for large bundles
 * 
 * 4. MEASURE: Verify improvement
 *    - Profile again
 *    - Compare before/after
 *    - Check actual user metrics
 */

// -------------------------------------------------------------------------------------------
// 7. PRODUCTION PROFILING
// -------------------------------------------------------------------------------------------

/**
 * Enable profiling in production build:
 * npx react-scripts build --profile
 * 
 * Or with webpack:
 * alias: {
 *   'react-dom$': 'react-dom/profiling',
 *   'scheduler/tracing': 'scheduler/tracing-profiling'
 * }
 */

// Send timing data to analytics
function reportWebVitals(metric) {
  const body = JSON.stringify(metric);
  navigator.sendBeacon('/analytics', body);
}

// -------------------------------------------------------------------------------------------
// 8. KEY METRICS
// -------------------------------------------------------------------------------------------

/**
 * REACT-SPECIFIC:
 * - Render time (actualDuration)
 * - Render count
 * - Wasted renders
 *
 * WEB VITALS:
 * - FCP: First Contentful Paint
 * - LCP: Largest Contentful Paint
 * - FID: First Input Delay
 * - CLS: Cumulative Layout Shift
 * - TTI: Time to Interactive
 */

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Use DevTools Profiler to identify issues
 * 2. Measure before and after optimization
 * 3. Focus on user-impacting problems
 * 4. Don't optimize prematurely
 *
 * BEST PRACTICES:
 * - Profile real-world scenarios
 * - Focus on components that render often
 * - Track metrics in production
 * - Use why-did-you-render in development
 *
 * TOOLS:
 * - React DevTools Profiler
 * - Chrome Performance tab
 * - Lighthouse
 * - why-did-you-render
 */
