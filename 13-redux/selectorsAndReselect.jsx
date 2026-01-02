/**
 * TOPIC: Selectors & Reselect
 * DESCRIPTION:
 * Selectors are functions that extract specific pieces of data from the Redux state.
 * "Reselect" is a library (included in RTK) for creating memoized selectors,
 * which is crucial for performance to prevent unnecessary re-renders.
 */

import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

// -------------------------------------------------------------------------------------------
// 1. BASIC SELECTORS
// -------------------------------------------------------------------------------------------

/**
 * A basic selector is just a function: (state) => derivedValue
 */

const selectCounter = (state) => state.counter;
const selectCounterValue = (state) => state.counter.value;

// Usage in component
// const count = useSelector(selectCounterValue);

// -------------------------------------------------------------------------------------------
// 2. MEMOIZED SELECTORS (createSelector)
// -------------------------------------------------------------------------------------------

/**
 * `createSelector` takes one or more input selectors and a result function.
 * It memoizes the result: if inputs haven't changed, strictly return the
 * previous result without recalculating.
 */

const selectItems = (state) => state.shop.items;
const selectTaxPercent = (state) => state.shop.taxPercent;

// Derived selector
export const selectSubtotal = createSelector(
  [selectItems],
  (items) => items.reduce((acc, item) => acc + item.value, 0)
);

// Composed selector (uses other selectors as input)
export const selectTotal = createSelector(
  [selectSubtotal, selectTaxPercent],
  (subtotal, taxPercent) => {
    return subtotal + (subtotal * (taxPercent / 100));
  }
);

// -------------------------------------------------------------------------------------------
// 3. WHY MEMOIZATION MATTERS?
// -------------------------------------------------------------------------------------------

/**
 * useSelector performs a strict reference equality check (===).
 * If a selector returns a NEW object/array every time, the component re-renders
 * on *every* Redux action, even if the data didn't meaningfully change.
 */

// BAD: Returns new array reference every time
const selectDoneTodosBad = (state) => state.todos.filter((t) => t.isDone);

// GOOD: Returns cached array if `state.todos` hasn't changed
export const selectDoneTodosGood = createSelector(
  [(state) => state.todos],
  (todos) => todos.filter((t) => t.isDone)
);

// -------------------------------------------------------------------------------------------
// 4. PARAMETERIZED SELECTORS
// -------------------------------------------------------------------------------------------

/**
 * Sometimes you need to select data based on props (e.g., getting a specific user by ID).
 */

const selectUserById = createSelector(
  [
    (state) => state.users,
    (state, userId) => userId // Accessing the second argument
  ],
  (users, userId) => users.find((user) => user.id === userId)
);

// Usage:
// const user = useSelector(state => selectUserById(state, props.userId));

// NOTE: Parameterized selectors sharing the same instance can have memoization issues
// if used in multiple components with different IDs. (Cache size of 1).
// For shared components, use a "Factory Selector" pattern.

// -------------------------------------------------------------------------------------------
// 5. FACTORY SELECTORS (Advanced)
// -------------------------------------------------------------------------------------------

/*
// makeSelectUser.js
export const makeSelectUser = () => {
  return createSelector(
    [(state) => state.users, (state, userId) => userId],
    (users, userId) => users.find(u => u.id === userId)
  )
}

// Component.js
const MyComponent = ({ userId }) => {
  // Create a unique selector instance for this component instance
  const selectUser = useMemo(makeSelectUser, []);
  
  const user = useSelector(state => selectUser(state, userId));
  // ...
}
*/

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Selectors encapsulate state structure.
 * 2. `createSelector` memoizes results to improve performance.
 * 3. `useSelector` re-runs whenever *any* action is dispatched.
 *
 * BEST PRACTICES:
 * - Colocate selectors with their slices.
 * - Always use memoized selectors if performing expensive calculations or returning new objects/arrays.
 * - Keep state minimal; compute derived data with selectors.
 * - Name selectors starting with `select...`.
 */
