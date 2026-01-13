/**
 * TOPIC: useRef HOOK
 * DESCRIPTION:
 * useRef creates a mutable reference that persists across renders.
 * It's used for DOM access, storing mutable values without re-renders,
 * and preserving values between renders.
 */

import { useRef, useState, useEffect } from 'react';

// -------------------------------------------------------------------------------------------
// 1. DOM REFERENCES
// -------------------------------------------------------------------------------------------

function TextInput() {
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current.focus();
  };

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>Focus Input</button>
    </div>
  );
}

function VideoPlayer() {
  const videoRef = useRef(null);

  const play = () => videoRef.current.play();
  const pause = () => videoRef.current.pause();

  return (
    <div>
      <video ref={videoRef} src="/video.mp4" />
      <button onClick={play}>Play</button>
      <button onClick={pause}>Pause</button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 2. MUTABLE VALUES (NO RE-RENDER)
// -------------------------------------------------------------------------------------------

/**
 * useRef doesn't trigger re-renders when .current changes.
 * Use for values that need to persist but don't affect UI.
 */

function Timer() {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  const start = () => {
    // Prevent stacking multiple intervals
    if (intervalRef.current !== null) return;
    intervalRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null; // Reset after clearing
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div>
      <p>{seconds}s</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}

function RenderCounter() {
  const renderCount = useRef(0);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    renderCount.current += 1;
  });

  // NOTE: Accessing ref.current in render is generally discouraged.
  // This works here because we're displaying the count AFTER render completes.
  // For truly reactive display, sync to state:
  const displayCount = renderCount.current;

  return (
    <div>
      <p>Renders: {displayCount}</p>
      <button onClick={() => forceUpdate((n) => n + 1)}>Force Update</button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 3. PREVIOUS VALUE
// -------------------------------------------------------------------------------------------

function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>Current: {count}, Previous: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 4. CALLBACK REFS
// -------------------------------------------------------------------------------------------

/**
 * Callback refs for dynamic access or when ref changes.
 */

function MeasuredComponent() {
  const [height, setHeight] = useState(0);

  const measuredRef = (node) => {
    if (node !== null) {
      setHeight(node.getBoundingClientRect().height);
    }
  };

  return (
    <div>
      <div ref={measuredRef}>Content to measure</div>
      <p>Height: {height}px</p>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 5. STORING LATEST VALUE IN EFFECTS
// -------------------------------------------------------------------------------------------

function LatestCallback({ onClick }) {
  const callbackRef = useRef(onClick);

  // Keep ref updated with latest callback
  useEffect(() => {
    callbackRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        callbackRef.current?.(); // Always uses latest
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, []); // No dependency on onClick!

  return <div>Press Enter</div>;
}

// -------------------------------------------------------------------------------------------
// 6. COMPARING WITH useState
// -------------------------------------------------------------------------------------------

/**
 * useState: Triggers re-render when updated
 * useRef: Does NOT trigger re-render when .current changes
 */

function Comparison() {
  const [stateValue, setStateValue] = useState(0);
  const refValue = useRef(0);

  const incrementState = () => setStateValue((s) => s + 1); // Re-renders
  const incrementRef = () => {
    refValue.current += 1;
    console.log('Ref value (check console):', refValue.current);
  };

  console.log('Render triggered');

  /**
   * IMPORTANT: We avoid displaying refValue.current in JSX because:
   * 1. It won't update when ref changes (no re-render)
   * 2. React's rules discourage reading refs during render
   * 3. The displayed value could be stale/inconsistent
   *
   * To observe ref changes, check the console or sync to state.
   */

  return (
    <div>
      <p>State: {stateValue}</p>
      <p>Ref: (see console - refs don't trigger re-renders)</p>
      <button onClick={incrementState}>Inc State</button>
      <button onClick={incrementRef}>Inc Ref (no re-render)</button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 7. COMMON PATTERNS
// -------------------------------------------------------------------------------------------

// Scroll to element
function ScrollToBottom({ messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ul>
      {messages.map((m) => <li key={m.id}>{m.text}</li>)}
      <div ref={bottomRef} />
    </ul>
  );
}

// Form with uncontrolled inputs
function UncontrolledForm() {
  const nameRef = useRef(null);
  const emailRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      name: nameRef.current.value,
      email: emailRef.current.value,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={nameRef} placeholder="Name" />
      <input ref={emailRef} placeholder="Email" />
      <button type="submit">Submit</button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. useRef persists values across renders
 * 2. Changing .current does NOT trigger re-render
 * 3. Use for DOM access and mutable values
 * 4. Initial value is set once on mount
 *
 * USE CASES:
 * - DOM element references (focus, scroll, measure)
 * - Storing timer/interval IDs
 * - Storing previous values
 * - Storing latest callback for effects
 * - Any mutable value that shouldn't cause re-render
 *
 * BEST PRACTICES:
 * - Don't read/write .current during render
 * - Use for values that don't affect visual output
 * - Consider useImperativeHandle for exposing methods
 */
