/**
 * TOPIC: Core Redux Concepts
 * DESCRIPTION:
 * Understanding the fundamental principles of Redux: Store, Actions, Reducers,
 * and the unidirectional data flow. While Redux Toolkit simplifies this,
 * knowing the core concepts is crucial for debugging and architectural decisions.
 */

// -------------------------------------------------------------------------------------------
// 1. THREE PRINCIPLES OF REDUX
// -------------------------------------------------------------------------------------------

/**
 * 1. Single Source of Truth:
 *    The global state of your application is stored in an object tree within a single store.
 *    This makes it easy to create universal apps, debug, and inspect the state.
 *
 * 2. State is Read-Only:
 *    The only way to change the state is to emit an action, an object describing what happened.
 *    This ensures that views or network callbacks don't write directly to the state.
 *
 * 3. Changes are made with Pure Functions (Reducers):
 *    To specify how the state tree is transformed by actions, you write pure reducers.
 *    Pure functions always return the same output for the same input and have no side effects.
 */

// -------------------------------------------------------------------------------------------
// 2. ACTIONS AND ACTION CREATORS
// -------------------------------------------------------------------------------------------

/**
 * An ACTION is a plain JavaScript object that has a `type` field.
 * It describes "what happened".
 * Optional `payload` field contains additional data.
 */

const INCREMENT = 'counter/increment';
const DECREMENT = 'counter/decrement';
const ADD_TODO = 'todos/addTodo';

// Action Object Example
const incrementAction = {
  type: INCREMENT,
};

// Action Creator: A function that returns an action
const addTodo = (text) => {
  return {
    type: ADD_TODO,
    payload: {
      id: Date.now(),
      text,
      completed: false,
    },
  };
};

// -------------------------------------------------------------------------------------------
// 3. REDUCERS
// -------------------------------------------------------------------------------------------

/**
 * A REDUCER is a function that takes the current state and an action,
 * and returns the new state.
 * Signature: (state, action) => newState
 *
 * Rules:
 * 1. Never mutate the state directly (in vanilla Redux).
 * 2. Return a new copy of the state object.
 */

const initialState = {
  value: 0,
};

const counterReducer = (state = initialState, action) => {
  switch (action.type) {
    case INCREMENT:
      // CORRECT: Returning a new object
      return {
        ...state,
        value: state.value + 1,
      };

    case DECREMENT:
      return {
        ...state,
        value: state.value - 1,
      };

    // Always return current state for unknown actions
    default:
      return state;
  }
};

// -------------------------------------------------------------------------------------------
// 4. STORE
// -------------------------------------------------------------------------------------------

/**
 * The STORE is the object that brings actions and reducers together.
 * Responsibilities:
 * - Holds application state
 * - Allows access to state via getState()
 * - Allows state to be updated via dispatch(action)
 * - Registers listeners via subscribe(listener)
 */

import { configureStore } from '@reduxjs/toolkit';

// In modern Redux, we use configureStore (which uses createStore internally)
const store = configureStore({
  reducer: {
    counter: counterReducer,
    // other reducers...
  },
});

// -------------------------------------------------------------------------------------------
// 5. DATA FLOW
// -------------------------------------------------------------------------------------------

/**
 * The data lifecycle in any Redux app follows these 4 steps:
 *
 * 1. You call store.dispatch(action)
 *    e.g., dispatch(addTodo('Learn Redux'))
 *
 * 2. The Redux store calls the reducer function you gave it
 *    The store passes two arguments: current state and the action.
 *
 * 3. The root reducer may combine output of multiple reducers
 *    into a single state tree.
 *
 * 4. The Redux store saves the complete state tree returned by the root reducer
 *    The new tree is now the next state of your app.
 *    Any UI subscribed to the store will update.
 */

// Example Interaction
console.log('Initial state:', store.getState());
// Output: { counter: { value: 0 } }

const unsubscribe = store.subscribe(() => {
  console.log('State updated:', store.getState());
});

store.dispatch({ type: INCREMENT });
// Output: State updated: { counter: { value: 1 } }

store.dispatch({ type: INCREMENT });
// Output: State updated: { counter: { value: 2 } }

store.dispatch({ type: DECREMENT });
// Output: State updated: { counter: { value: 1 } }

unsubscribe(); // Stop listening to updates

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Redux is a predictable state container for JavaScript apps.
 * 2. Unidirectional data flow makes app behavior consistent and easy to test.
 * 3. State is read-only; changes happen via dispatched actions.
 * 4. Reducers are pure functions transforming (state, action) => newState.
 *
 * BEST PRACTICES:
 * - Use Redux Toolkit (RTK) instead of writing vanilla Redux logic.
 * - Normalize your state shape (flat is better than nested).
 * - Treat state as immutable (RTK does this for you with Immer).
 * - Keep reducers pure (no API calls or side effects in reducers).
 * - Use serializable data in state and actions (no Functions, Classes, Promises).
 */
