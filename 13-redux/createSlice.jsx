/**
 * TOPIC: Redux Toolkit - createSlice
 * DESCRIPTION:
 * `createSlice` is the standard approach for writing Redux logic.
 * It automatically generates action creators and action types that correspond
 * to the reducers and state. Ideally, you should use this for all Redux logic.
 */

import { createSlice } from '@reduxjs/toolkit';

// -------------------------------------------------------------------------------------------
// 1. BASIC SLICE STRUCTURE
// -------------------------------------------------------------------------------------------

/**
 * createSlice accepts an initial state, an object of reducer functions,
 * and a "slice name".
 *
 * It generates:
 * 1. Action creators (e.g., counterSlice.actions.increment)
 * 2. Action types (e.g., 'counter/increment')
 * 3. The reducer function (counterSlice.reducer)
 */

const counterSlice = createSlice({
  name: 'counter', // Prefix for action types
  initialState: {
    value: 0,
    status: 'idle',
  },
  reducers: {
    // Redux Toolkit uses Immer library internally.
    // This allows us to write "mutating" logic in reducers.
    // It doesn't actually mutate the state because Immer detects changes
    // and produces a brand new immutable state object.
    increment: (state) => {
      // "Mutating" code
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    reset: (state) => {
      state.value = 0;
    },
  },
});

// Generated actions
// console.log(counterSlice.actions.increment());
// Result: { type: 'counter/increment', payload: undefined }

// -------------------------------------------------------------------------------------------
// 2. PAYLOADS AND ACTION CREATORS
// -------------------------------------------------------------------------------------------

const todoSlice = createSlice({
  name: 'todos',
  initialState: [],
  reducers: {
    // Action with payload
    addTodo: (state, action) => {
      state.push({
        id: Date.now(), // Not ideal (side effect), see "prepare" below
        text: action.payload,
        completed: false,
      });
    },
    toggleTodo: (state, action) => {
      const todo = state.find((todo) => todo.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
  },
});

// -------------------------------------------------------------------------------------------
// 3. PREPARE CALLBACKS
// -------------------------------------------------------------------------------------------

/**
 * Sometimes you need to customize the payload contents (e.g., generate ID, timestamp).
 * Reducers must be pure, so generation logic should happen in the Action Creator.
 * Use the `prepare` callback to customize action creation.
 */

const postsSlice = createSlice({
  name: 'posts',
  initialState: [],
  reducers: {
    addPost: {
      // The reducer function
      reducer: (state, action) => {
        state.push(action.payload);
      },
      // The prepare callback (runs when dispatching action)
      prepare: (title, content) => {
        return {
          payload: {
            id: crypto.randomUUID(), // Side effects allowed here
            title,
            content,
            createdAt: new Date().toISOString(),
          },
        };
      },
    },
  },
});

// Usage: dispatch(postsSlice.actions.addPost('Hello', 'World'));
// Payload will have id, title, content, createdAt

// -------------------------------------------------------------------------------------------
// 4. EXTRA REDUCERS
// -------------------------------------------------------------------------------------------

/**
 * `extraReducers` allows a slice to respond to other action types besides the types it explicitly generated.
 * This is commonly used for:
 * 1. Responding to async thunks (pending/fulfilled/rejected)
 * 2. Responding to actions from other slices
 */

import { createAsyncThunk } from '@reduxjs/toolkit';

// Provides an async action
const fetchUserById = createAsyncThunk('users/fetchById', async (userId) => {
  const response = await fetch(`https://reqres.in/api/users/${userId}`);
  return response.json();
});

const usersSlice = createSlice({
  name: 'users',
  initialState: { entities: [], loading: 'idle' },
  reducers: {
    // Standard reducers here
  },
  extraReducers: (builder) => {
    // Builder pattern is recommended for type safety
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = 'loading';
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = 'idle';
        state.entities.push(action.payload);
      })
      .addCase(fetchUserById.rejected, (state) => {
        state.loading = 'failed';
      });
  },
});

// -------------------------------------------------------------------------------------------
// 5. EXPORTING AND STORE SETUP
// -------------------------------------------------------------------------------------------

// 1. Export Actions (for components to dispatch)
export const { increment, decrement, reset } = counterSlice.actions;
export const { addTodo, toggleTodo } = todoSlice.actions;

// 2. Export Reducer (to add to store)
export default counterSlice.reducer;

/**
 * In store.js:
 *
 * import counterReducer from './features/counter/counterSlice';
 * import todoReducer from './features/todos/todoSlice';
 *
 * export const store = configureStore({
 *   reducer: {
 *     counter: counterReducer,
 *     todos: todoReducer,
 *   },
 * });
 */

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. `createSlice` replaces switch statements with lookup tables.
 * 2. Immer allows writing cleaner "mutating" syntax in reducers.
 * 3. `prepare` method allows logic in action creators (ids, timestamps).
 * 4. `extraReducers` handles external actions (like Thunks).
 *
 * BEST PRACTICES:
 * - One slice per feature (auth, posts, users).
 * - Keep state minimal and serializable.
 * - Use `extraReducers` with the builder pattern for better type support.
 * - Name slices meaningfully as this namespace is used in action types.
 */
