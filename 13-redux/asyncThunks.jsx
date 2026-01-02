/**
 * TOPIC: Async Thunks (createAsyncThunk)
 * DESCRIPTION:
 * Redux is synchronous by default. To handle asynchronous logic (like data fetching),
 * we use "Thunks". Redux Toolkit includes `createAsyncThunk` to simplify the standard
 * async request lifecycle (pending -> fulfilled/rejected).
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// -------------------------------------------------------------------------------------------
// 1. BASIC ASYNC THUNK
// -------------------------------------------------------------------------------------------

/**
 * createAsyncThunk accepts:
 * 1. A string action type prefix ('users/fetchById')
 * 2. An async payload creator callback function
 */

export const fetchUser = createAsyncThunk(
  'users/fetchById', // Action type prefix
  // Payload creator
  async (userId, thunkAPI) => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
    return response.json(); // The returned value becomes the `fulfilled` action payload
  }
);

// -------------------------------------------------------------------------------------------
// 2. HANDLING THUNK PARAMS (thunkAPI)
// -------------------------------------------------------------------------------------------

/**
 * The payload creator receives two arguments:
 * 1. `arg`: The value passed when dispatching the thunk
 *    e.g., dispatch(fetchUser(123)) -> arg is 123
 *
 * 2. `thunkAPI`: An object containing standard Redux thunk parameters:
 *    - dispatch
 *    - getState
 *    - extra (if configured)
 *    - requestId
 *    - signal (AbortSignal)
 *    - rejectWithValue (utility to return custom error payloads)
 */

export const updateUser = createAsyncThunk(
  'users/update',
  async (userData, { rejectWithValue, getState }) => {
    // Access current state if needed
    const { auth } = getState();
    const token = auth.token;

    try {
      const response = await fetch(`/api/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        // Return a custom error payload instead of throwing
        const errorData = await response.json();
        return rejectWithValue(errorData.message);
      }

      return await response.json();
    } catch (err) {
      return rejectWithValue('Network error occurred');
    }
  }
);

// -------------------------------------------------------------------------------------------
// 3. INTEGRATING WITH SLICE (extraReducers)
// -------------------------------------------------------------------------------------------

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    entities: [],
    loading: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
    currentRequestId: undefined,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 1. PENDING State
      .addCase(fetchUser.pending, (state, action) => {
        if (state.loading === 'idle') {
          state.loading = 'pending';
          state.currentRequestId = action.meta.requestId;
        }
      })
      // 2. FULFILLED State (Success)
      .addCase(fetchUser.fulfilled, (state, action) => {
        const { requestId } = action.meta;
        if (state.loading === 'pending' && state.currentRequestId === requestId) {
          state.loading = 'idle';
          state.entities.push(action.payload);
          state.currentRequestId = undefined;
        }
      })
      // 3. REJECTED State (Error)
      .addCase(fetchUser.rejected, (state, action) => {
        const { requestId } = action.meta;
        if (state.loading === 'pending' && state.currentRequestId === requestId) {
          state.loading = 'idle';
          state.error = action.payload || action.error.message;
          state.currentRequestId = undefined;
        }
      });
  },
});

// -------------------------------------------------------------------------------------------
// 4. CANCELLATION
// -------------------------------------------------------------------------------------------

/**
 * Thunks can be cancelled. When you dispatch a thunk, it returns a promise
 * that has an `abort()` method.
 */

// Component code example:
/*
  useEffect(() => {
    const promise = dispatch(fetchUser(userId));

    return () => {
      // Abort the request on component unmount
      promise.abort();
    };
  }, [userId, dispatch]);
*/

// In the thunk, pass the signal to your fetch request:
export const fetchWithCancel = createAsyncThunk(
  'data/fetch',
  async (_, { signal }) => {
    const response = await fetch('/api/data', { signal });
    return response.json();
  }
);

// -------------------------------------------------------------------------------------------
// 5. CONDITIONAL FETCHING
// -------------------------------------------------------------------------------------------

/**
 * Use `condition` option to prevent a thunk from running if not needed.
 * e.g., Don't fetch if data is already cached or request is in progress.
 */

export const fetchPostsIfNeeded = createAsyncThunk(
  'posts/fetch',
  async (userId) => {
    const response = await fetch(`/api/posts/${userId}`);
    return response.json();
  },
  {
    condition: (userId, { getState }) => {
      const { posts } = getState();
      // If we're already fetching, don't re-run
      if (posts.status === 'pending') {
        return false; // Cancels execution
      }
    },
  }
);

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. `createAsyncThunk` generates 3 actions: pending, fulfilled, rejected.
 * 2. Use `rejectWithValue` to handle backend errors and pass custom payloads.
 * 3. Handle loading and error states in `extraReducers`.
 * 4. Supports cancellation via AbortController signals.
 *
 * BEST PRACTICES:
 * - Return `rejectWithValue` for expected API errors (400/500).
 * - Use the Loading/Idle/Failed state pattern (enum string instead of booleans).
 * - Consider using RTK Query (built on top of thunks) for data fetching as it handles caching automatically.
 */
