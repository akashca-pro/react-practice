/**
 * TOPIC: REDUX TOOLKIT
 * DESCRIPTION:
 * Redux Toolkit (RTK) is the official, recommended way to use Redux.
 * It simplifies Redux with less boilerplate and includes best practices.
 * npm install @reduxjs/toolkit react-redux
 */

import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Provider, useSelector, useDispatch } from 'react-redux';

// -------------------------------------------------------------------------------------------
// 1. CREATING SLICES
// -------------------------------------------------------------------------------------------

/**
 * A slice contains reducer logic and actions for a feature.
 */

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1; // Immer allows "mutation"
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
    reset: (state) => {
      state.value = 0;
    },
  },
});

// Export actions
export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions;

// -------------------------------------------------------------------------------------------
// 2. CONFIGURING STORE
// -------------------------------------------------------------------------------------------

const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
    todos: todosSlice.reducer,
    user: userSlice.reducer,
  },
  // Middleware is auto-configured (thunk, serializable check, etc.)
});

// Provider setup
function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  );
}

// -------------------------------------------------------------------------------------------
// 3. USING IN COMPONENTS
// -------------------------------------------------------------------------------------------

function Counter() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <span>{count}</span>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 4. TODOS SLICE EXAMPLE
// -------------------------------------------------------------------------------------------

const todosSlice = createSlice({
  name: 'todos',
  initialState: {
    items: [],
    filter: 'all',
  },
  reducers: {
    addTodo: (state, action) => {
      state.items.push({
        id: Date.now(),
        text: action.payload,
        completed: false,
      });
    },
    toggleTodo: (state, action) => {
      const todo = state.items.find((t) => t.id === action.payload);
      if (todo) todo.completed = !todo.completed;
    },
    removeTodo: (state, action) => {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
  },
});

export const { addTodo, toggleTodo, removeTodo, setFilter } = todosSlice.actions;

// -------------------------------------------------------------------------------------------
// 5. ASYNC THUNKS
// -------------------------------------------------------------------------------------------

/**
 * createAsyncThunk handles async logic with automatic loading states.
 */

const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Usage
function UserList() {
  const { items, loading, error } = useSelector((state) => state.users);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <ul>{items.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}

// -------------------------------------------------------------------------------------------
// 6. SELECTORS
// -------------------------------------------------------------------------------------------

/**
 * Create reusable selectors with createSelector for memoization.
 */

import { createSelector } from '@reduxjs/toolkit';

// Basic selector
const selectTodos = (state) => state.todos.items;
const selectFilter = (state) => state.todos.filter;

// Memoized selector
const selectFilteredTodos = createSelector(
  [selectTodos, selectFilter],
  (todos, filter) => {
    switch (filter) {
      case 'completed':
        return todos.filter((t) => t.completed);
      case 'active':
        return todos.filter((t) => !t.completed);
      default:
        return todos;
    }
  }
);

// Usage
function FilteredTodoList() {
  const filteredTodos = useSelector(selectFilteredTodos);
  return <ul>{filteredTodos.map((t) => <li key={t.id}>{t.text}</li>)}</ul>;
}

// -------------------------------------------------------------------------------------------
// 7. RTK QUERY (DATA FETCHING)
// -------------------------------------------------------------------------------------------

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['User', 'Post'],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => '/users',
      providesTags: ['User'],
    }),
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    createUser: builder.mutation({
      query: (user) => ({
        url: '/users',
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useGetUsersQuery, useGetUserByIdQuery, useCreateUserMutation } = api;

// Usage in component
function Users() {
  const { data, isLoading, error } = useGetUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  if (isLoading) return <p>Loading...</p>;
  return (
    <div>
      <ul>{data.map((u) => <li key={u.id}>{u.name}</li>)}</ul>
      <button onClick={() => createUser({ name: 'New User' })}>Add User</button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 8. TYPED HOOKS (TYPESCRIPT)
// -------------------------------------------------------------------------------------------

// store.ts
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// hooks.ts
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY FEATURES:
 * 1. createSlice for reducers + actions
 * 2. configureStore with defaults
 * 3. createAsyncThunk for async
 * 4. RTK Query for data fetching
 *
 * BEST PRACTICES:
 * - Use createSlice for all reducers
 * - Use createSelector for derived data
 * - Use RTK Query for server state
 * - Use TypeScript for type safety
 * - Organize by feature/slice
 *
 * VS VANILLA REDUX:
 * - 75% less boilerplate
 * - Built-in Immer
 * - Auto DevTools
 * - Thunk included
 */
