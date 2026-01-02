/**
 * TOPIC: LIFECYCLE AND CLEANUP
 * DESCRIPTION:
 * Understanding React component lifecycle, cleanup patterns, and how
 * to properly manage side effects to prevent memory leaks.
 */

import { useState, useEffect, useLayoutEffect, useRef } from 'react';

// -------------------------------------------------------------------------------------------
// 1. COMPONENT LIFECYCLE PHASES
// -------------------------------------------------------------------------------------------

/**
 * React functional component lifecycle phases:
 *
 * 1. MOUNT - Component is created and inserted into DOM
 * 2. UPDATE - Component re-renders due to state/prop changes
 * 3. UNMOUNT - Component is removed from DOM
 *
 * useEffect maps to these phases:
 * - No deps array: Runs after every render
 * - Empty deps []: Runs only on mount
 * - With deps [a, b]: Runs when dependencies change
 * - Return function: Runs on unmount (cleanup)
 */

function LifecycleDemo() {
  const [count, setCount] = useState(0);

  // Runs on EVERY render
  useEffect(() => {
    console.log('Rendered!');
  });

  // Runs only on MOUNT
  useEffect(() => {
    console.log('Mounted!');

    // Runs on UNMOUNT
    return () => {
      console.log('Unmounted!');
    };
  }, []);

  // Runs when count UPDATES
  useEffect(() => {
    console.log('Count changed to:', count);

    // Cleanup before next effect and on unmount
    return () => {
      console.log('Cleaning up previous count:', count);
    };
  }, [count]);

  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// -------------------------------------------------------------------------------------------
// 2. CLEANUP PATTERNS
// -------------------------------------------------------------------------------------------

// Event listeners
function EventListenerCleanup() {
  useEffect(() => {
    const handleResize = () => console.log(window.innerWidth);
    window.addEventListener('resize', handleResize);

    // Cleanup: Remove listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);
}

// Timers
function TimerCleanup() {
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('Tick');
    }, 1000);

    // Cleanup: Clear interval
    return () => clearInterval(intervalId);
  }, []);
}

// Subscriptions
function SubscriptionCleanup({ userId }) {
  useEffect(() => {
    const subscription = api.subscribe(userId, handleUpdate);

    // Cleanup: Unsubscribe
    return () => subscription.unsubscribe();
  }, [userId]);
}

// Abort controller for fetches
function FetchCleanup({ url }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(setData)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });

    // Cleanup: Abort pending request
    return () => controller.abort();
  }, [url]);

  return <div>{JSON.stringify(data)}</div>;
}

// -------------------------------------------------------------------------------------------
// 3. STALE CLOSURE PREVENTION
// -------------------------------------------------------------------------------------------

/**
 * Cleanup also prevents stale closure issues.
 */

function StaleClosureExample({ id }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      const result = await fetch(`/api/data/${id}`);
      const json = await result.json();

      // Only set state if not cancelled
      if (!cancelled) {
        setData(json);
      }
    }

    fetchData();

    // Cleanup: Mark as cancelled
    return () => {
      cancelled = true;
    };
  }, [id]);

  return <div>{JSON.stringify(data)}</div>;
}

// -------------------------------------------------------------------------------------------
// 4. useLayoutEffect VS useEffect
// -------------------------------------------------------------------------------------------

/**
 * useLayoutEffect runs BEFORE browser paint.
 * useEffect runs AFTER browser paint.
 */

function LayoutEffectExample() {
  const ref = useRef(null);

  // Runs BEFORE paint - good for DOM measurements
  useLayoutEffect(() => {
    const height = ref.current.getBoundingClientRect().height;
    // Synchronously update something based on measurement
  }, []);

  // Runs AFTER paint - good for most effects
  useEffect(() => {
    // Data fetching, subscriptions, etc.
  }, []);

  return <div ref={ref}>Content</div>;
}

// Tooltip positioning
function Tooltip({ children, target }) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef(null);

  useLayoutEffect(() => {
    // Measure and position before paint to avoid flicker
    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    setPosition({
      top: targetRect.bottom + 8,
      left: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
    });
  }, [target]);

  return (
    <div ref={tooltipRef} style={{ position: 'fixed', ...position }}>
      {children}
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 5. CLEANUP ORDER
// -------------------------------------------------------------------------------------------

/**
 * Cleanup runs:
 * 1. Before every re-run of the effect
 * 2. When component unmounts
 */

function CleanupOrder() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log(`Effect: count is ${count}`);

    return () => {
      console.log(`Cleanup: count was ${count}`);
    };
  }, [count]);

  // If count goes 0 -> 1 -> 2:
  // "Effect: count is 0"
  // "Cleanup: count was 0"
  // "Effect: count is 1"
  // "Cleanup: count was 1"
  // "Effect: count is 2"
}

// -------------------------------------------------------------------------------------------
// 6. REF-BASED CLEANUP
// -------------------------------------------------------------------------------------------

/**
 * Use refs to access latest values in cleanup without re-running effect.
 */

function RefCleanup({ onUnmount }) {
  const onUnmountRef = useRef(onUnmount);

  // Keep ref updated
  useLayoutEffect(() => {
    onUnmountRef.current = onUnmount;
  });

  // Effect only runs once, but cleanup uses latest callback
  useEffect(() => {
    return () => {
      onUnmountRef.current?.();
    };
  }, []);
}

// -------------------------------------------------------------------------------------------
// 7. COMMON MISTAKES
// -------------------------------------------------------------------------------------------

// ❌ Missing cleanup
function BadComponent() {
  useEffect(() => {
    const id = setInterval(() => {}, 1000);
    // Missing: return () => clearInterval(id);
  }, []);
}

// ❌ Setting state after unmount
function BadFetch({ url }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData); // May run after unmount!
  }, [url]);
}

// ✅ Proper cleanup
function GoodFetch({ url }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (mounted) setData(data);
      });

    return () => { mounted = false; };
  }, [url]);
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * LIFECYCLE PHASES:
 * 1. Mount → useEffect(..., [])
 * 2. Update → useEffect(..., [deps])
 * 3. Unmount → return () => {...}
 *
 * CLEANUP NEEDED FOR:
 * - Event listeners
 * - Timers (setTimeout, setInterval)
 * - Subscriptions
 * - Fetch requests
 * - WebSocket connections
 * - Observers (Intersection, Mutation, Resize)
 *
 * BEST PRACTICES:
 * - Always return cleanup for side effects
 * - Use AbortController for fetch
 * - Use flags to prevent stale updates
 * - Use useLayoutEffect for DOM measurements
 * - Use refs for stable callback references
 */
