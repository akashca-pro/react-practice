/**
 * TOPIC: Redux DevTools
 * DESCRIPTION:
 * The Redux DevTools Extension is an essential tool for debugging Redux apps.
 * It allows you to inspect every action, see the state diff, and even
 * "time travel" by cancelling actions.
 */

// -------------------------------------------------------------------------------------------
// 1. SETUP
// -------------------------------------------------------------------------------------------

/**
 * If you are using Redux Toolkit, Redux DevTools is ENABLED BY DEFAULT.
 * No extra configuration is required.
 */

import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: { /* reducers */ },
  devTools: true, // Set to false to disable in production
});

// -------------------------------------------------------------------------------------------
// 2. KEY FEATURES
// -------------------------------------------------------------------------------------------

/**
 * A. Action Log (Left Panel)
 * - Shows a list of all dispatched actions in order.
 * - Clicking an action lets you inspect the State logic at that point in time.
 * - "Jump" allows you to set the state to that point (time travel).
 * - "Skip" allows you to toggle an action without removing it from history (re-calculates state).
 *
 * B. Inspector (Right Panel)
 * - Diff: Shows what changed in the state tree after the action.
 * - Action: Shows the action object (type, payload).
 * - State: Shows the entire state tree at that point.
 * - Trace: Shows the stack trace of where the action was dispatched (requires setup).
 *
 * C. Chart / Tree View
 * - Visualizes your state as a tree diagram.
 */

// -------------------------------------------------------------------------------------------
// 3. ADVANCED DEVTOOLS CONFIGURATION
// -------------------------------------------------------------------------------------------

/*
const store = configureStore({
  reducer: rootReducer,
  devTools: {
    name: 'My App', // Instance name shown in DevTools
    trace: true, // Enable stack trace (slower performance)
    traceLimit: 25,
  },
});
*/

// -------------------------------------------------------------------------------------------
// 4. DEBUGGING WORKFLOW EXAMPLE
// -------------------------------------------------------------------------------------------

/**
 * Scenario: A counter isn't updating correctly.
 *
 * 1. Open Redux DevTools.
 * 2. Click the "Increment" button in your app.
 * 3. Look at the Action Log. Did an action fire?
 *    - NO: Issue is in the Component (onClick handler) or mapDispatch.
 *    - YES: Click the action name.
 *
 * 4. Look at the "Diff" tab.
 *    - Did the state change as expected?
 *    - If NO, the issue is in the Reducer logic.
 *
 * 5. Look at the "Action" tab.
 *    - Is the payload correct?
 *    - If NO, the issue is in the Action Creator or dispatch argument.
 */

// -------------------------------------------------------------------------------------------
// 5. LOG MONITOR VS INSPECTOR
// -------------------------------------------------------------------------------------------

/**
 * You can switch views in the DevTools.
 * - Inspector: The standard view described above.
 * - Log Monitor: A text-based log inside your app (legacy).
 * - Chart: Visual graph of state.
 */

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Crucial for understanding data flow and debugging state changes.
 * 2. "Time Travel" lets you replay or rollback actions.
 * 3. Enabled by default in RTK.
 *
 * BEST PRACTICES:
 * - Use the "Diff" view primarily to verify reducers.
 * - Disable DevTools in production builds (via environment variables) if state contains sensitive data.
 * - Use meaningful action types (`feature/action`) to make logs readable.
 */
