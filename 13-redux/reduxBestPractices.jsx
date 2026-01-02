/**
 * TOPIC: Redux Best Practices
 * DESCRIPTION:
 * Guidelines for writing clean, maintainable, and performant Redux code.
 * Following the official "Redux Style Guide".
 */

// -------------------------------------------------------------------------------------------
// 1. PRIORITY RULES (DO THESE!)
// -------------------------------------------------------------------------------------------

/**
 * A. Use Redux Toolkit
 *    - Standard way to write Redux logic.
 *
 * B. Do Not Mutate State
 *    - Even with Immer, conceptually understand that state is immutable.
 *
 * C. Reducers Should Not Have Side Effects
 *    - No AJAX calls, no random numbers, no `Date.now()` inside reducers.
 *    - Put these in Action Creators or Thunks.
 *
 * D. Serializable Data Only
 *    - Store plain JS objects and arrays.
 *    - No Map, Set, Promise, Function, or Class instances.
 *
 * E. Only One Store
 *    - A standard Redux app should only have one store instance.
 */

// -------------------------------------------------------------------------------------------
// 2. STORE SETUP & ORGANIZATION
// -------------------------------------------------------------------------------------------

/**
 * FEATURE FOLDER STRUCTURE:
 * Organize code by feature, not by type.
 *
 * BAD:
 * /actions
 *   - userActions.js
 *   - postActions.js
 * /reducers
 *   - userReducer.js
 *
 * GOOD:
 * /features
 *   /users
 *     - usersSlice.js (contains actions & reducer)
 *     - UsersComponent.jsx
 *   /posts
 *     - postsSlice.js
 */

// -------------------------------------------------------------------------------------------
// 3. STATE SHAPE & NORMALIZATION
// -------------------------------------------------------------------------------------------

/**
 * Keep state "flat" and normalized (like a database).
 * Avoid deep nesting.
 */

// BAD (Nested)
/*
const state = {
  posts: [
    {
      id: 1,
      author: { id: 5, name: 'Alice' }, // Duplicated data if Alice has multiple posts
      comments: [ ... ]
    }
  ]
}
*/

// GOOD (Normalized)
/*
const state = {
  posts: {
    byId: {
      1: { id: 1, authorId: 5, commentIds: [10, 11] }
    },
    allIds: [1]
  },
  users: {
    byId: {
      5: { id: 5, name: 'Alice' }
    }
  },
  comments: { ... }
}
*/
// USE `createEntityAdapter` in RTK to help with normalization!

// -------------------------------------------------------------------------------------------
// 4. ACTIONS
// -------------------------------------------------------------------------------------------

/**
 * - Write Actions as "Events", not "Setters".
 *   BAD: `dispatch(setNewData(data))`
 *   GOOD: `dispatch(userUpdatedProfile(data))`
 *
 * - Allow Many Reducers to Respond to One Action.
 *   e.g., `auth/logout` can clear data in `postsSlice`, `usersSlice`, etc.
 */

// -------------------------------------------------------------------------------------------
// 5. SELECTORS
// -------------------------------------------------------------------------------------------

/**
 * - Name selectors `selectThing`.
 * - Co-locate selectors with the slice.
 * - Use Reselect for expensive derivations.
 */

// -------------------------------------------------------------------------------------------
// 6. TESTING
// -------------------------------------------------------------------------------------------

/**
 * - Prefer Integration Tests: Test the component + Redux interaction.
 * - Use "Redux Mock Store" only if strictly needed.
 * - Test reducers (input state + action = output state).
 */

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY TAKEAWAYS:
 * 1. **Redux Toolkit** is mandatory for modern Redux.
 * 2. **Feature Folders** logic is better than "file type" folders.
 * 3. **Immutability** is key (Immer handles it).
 * 4. **Side Effects** (async) belong in Thunks or Listeners, never Reducers.
 * 5. **Selectors** read data; Components shouldn't know state shape.
 */
