/**
 * TOPIC: Redux with TypeScript
 * DESCRIPTION:
 * Redux Toolkit is written in TypeScript and provides excellent TS support.
 * This file demonstrates how to type the Store, State, Actions, and Hooks.
 * (Note: In a real project, this file would be .ts or .tsx)
 */

import { configureStore, createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
// import type { TypedUseSelectorHook } from 'react-redux';
// import type { RootState, AppDispatch } from './store';

// -------------------------------------------------------------------------------------------
// 1. TYPING SLICE STATE AND ACTIONS
// -------------------------------------------------------------------------------------------

/**
 * Define an interface for the slice state.
 */

/*
interface CounterState {
  value: number;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: CounterState = {
  value: 0,
  status: 'idle',
};
*/

// const counterSlice = createSlice({
//   name: 'counter',
//   initialState, // Types inferred here
//   reducers: {
//     // Use PayloadAction<Type> to type the action payload
//     incrementByAmount: (state, action: PayloadAction<number>) => {
//       state.value += action.payload;
//     },
//   },
// });

// -------------------------------------------------------------------------------------------
// 2. TYPING THE STORE (store.ts)
// -------------------------------------------------------------------------------------------

/**
 * You don't need to manually define the global state interface.
 * TS can infer it from the store itself.
 */

const store = configureStore({
  reducer: {
    // counter: counterReducer
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
/*
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
*/

// -------------------------------------------------------------------------------------------
// 3. TYPED HOOKS (hooks.ts)
// -------------------------------------------------------------------------------------------

/**
 * Instead of importing `useDispatch` and `useSelector` in every component,
 * create pre-typed hooks. This saves you from typing (state: RootState) every time.
 */

/*
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
*/

// Usage in Component:
/*
const MyComponent = () => {
  const count = useAppSelector((state) => state.counter.value); // state is typed!
  const dispatch = useAppDispatch();
  // ...
}
*/

// -------------------------------------------------------------------------------------------
// 4. TYPING ASYNC THUNKS
// -------------------------------------------------------------------------------------------

/**
 * `createAsyncThunk` generics signature:
 * <Returned, ThunkArg, ThunkApiConfig>
 */

/*
interface User {
  id: number;
  name: string;
}

interface FetchUserError {
  message: string;
}

export const fetchUser = createAsyncThunk<
  User,           // Return type of the payload creator
  number,         // First argument to the payload creator
  { rejectValue: FetchUserError } // Types for thunkAPI properties
>(
  'users/fetch',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/users/${userId}`);
      return await response.json() as User;
    } catch (err) {
      return rejectWithValue({ message: 'Failed' });
    }
  }
);
*/

// -------------------------------------------------------------------------------------------
// 5. TYPING RTK QUERY
// -------------------------------------------------------------------------------------------

/*
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface Post {
  id: number;
  title: string;
  body: string;
}

export const postApi = createApi({
  reducerPath: 'postApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://jsonplaceholder.typicode.com/' }),
  endpoints: (builder) => ({
    // Use Generics: <ResponseType, ArgumentType>
    getPostById: builder.query<Post, number>({
      query: (id) => `posts/${id}`,
    }),
  }),
});
*/

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Use `ReturnType<typeof store.getState>` to infer RootState.
 * 2. Export strict `useAppDispatch` and `useAppSelector` hooks.
 * 3. Use `PayloadAction<T>` for reducers.
 *
 * BEST PRACTICES:
 * - Create a `hooks.ts` file to centralize typed hooks.
 * - Always use the typed hooks in components.
 * - Don't type the `state` argument in createSlice manually; let inference work.
 */
