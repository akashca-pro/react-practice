/**
 * TOPIC: Redux Middleware
 * DESCRIPTION:
 * Middleware provides a third-party extension point between dispatching an
 * action, and the moment it reaches the reducer. It's used for logging,
 * crash reporting, performing asynchronous tasks, etc.
 */

import { configureStore } from '@reduxjs/toolkit';

// -------------------------------------------------------------------------------------------
// 1. WHAT IS MIDDLEWARE?
// -------------------------------------------------------------------------------------------

/**
 * Middleware is a function that returns a function, which returns a function.
 * Signature: store => next => action
 *
 * It forms a pipeline. `next(action)` passes the action to the next middleware
 * (or the reducer if it's the last one).
 */

// -------------------------------------------------------------------------------------------
// 2. CUSTOM MIDDLEWARE EXAMPLE (LOGGER)
// -------------------------------------------------------------------------------------------

const loggerMiddleware = (storeAPI) => (next) => (action) => {
  console.group(action.type);
  console.info('dispatching', action);

  const result = next(action); // Pass action to the next middleware/reducer

  console.log('next state', storeAPI.getState());
  console.groupEnd();

  return result;
};

// -------------------------------------------------------------------------------------------
// 3. CUSTOM MIDDLEWARE (ANALYTICS)
// -------------------------------------------------------------------------------------------

const crashReporter = (store) => (next) => (action) => {
  try {
    return next(action);
  } catch (err) {
    console.error('Caught an exception!', err);
    // raven.captureException(err, {
    //   extra: {
    //     action,
    //     state: store.getState()
    //   }
    // })
    throw err;
  }
};

// -------------------------------------------------------------------------------------------
// 4. CONFIGURING MIDDLEWARE IN RTK
// -------------------------------------------------------------------------------------------

/**
 * Redux Toolkit includes some middleware by default:
 * - thunk (for async logic)
 * - serializableCheck (warns if non-serializable values are in state/actions)
 * - immutableCheck (warns if state is mutated)
 */

import rootReducer from './rootReducer'; // Assumption

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // You can configure default middleware here
      serializableCheck: {
        ignoredActions: ['some/action/with/non-serializable-payload'],
      },
    })
      // Add your custom middleware
      .concat(loggerMiddleware)
      .concat(crashReporter),
});

// -------------------------------------------------------------------------------------------
// 5. COMMONLY USED MIDDLEWARE
// -------------------------------------------------------------------------------------------

/**
 * 1. Redux Thunk (Built-in to RTK):
 *    Allows writing action creators that return a function instead of an action.
 *    Used for complex synchronous logic or simple async logic.
 *
 * 2. Redux Saga (External):
 *    Uses generator functions to handle side effects.
 *    Good for complex async flows (race conditions, cancellation).
 *
 * 3. Redux Observable (External):
 *    Uses RxJS observables for side effects.
 */

// -------------------------------------------------------------------------------------------
// 6. DYNAMIC MIDDLEWARE (ADVANCED)
// -------------------------------------------------------------------------------------------

/*
  Ideally, middleware is static. But you can create middleware that allows
  injecting logic at runtime.
*/

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Middleware sits between `dispatch` and `reducer`.
 * 2. It can stop, modify, or delay actions, or dispatch new actions.
 * 3. It has access to `getState` and `dispatch`.
 *
 * BEST PRACTICES:
 * - Use RTK's default middleware (thunk) generally.
 * - Use `getDefaultMiddleware().concat(myMiddleware)` to preserve defaults.
 * - Keep middleware focused on side effects (logging, analytics, api calls).
 * - Avoid heavy business logic in middleware; keep that in Thunks or Reducers.
 */
