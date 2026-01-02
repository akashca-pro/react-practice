/**
 * TOPIC: RTK Query
 * DESCRIPTION:
 * RTK Query is a powerful data fetching and caching tool included in Redux Toolkit.
 * It eliminates the need to write thunks and reducers for data fetching.
 * It handles caching, polling, invalidation, and optimistic updates automatically.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// -------------------------------------------------------------------------------------------
// 1. DEFINING AN API SLICE
// -------------------------------------------------------------------------------------------

/**
 * createApi() is the core of RTK Query.
 * It requires a `reducerPath` and a `baseQuery`.
 */

export const apiSlice = createApi({
  reducerPath: 'api', // Unique key for the store
  // fetchBaseQuery is a wrapper around fetch typical of Redux
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  // Tag types are used for caching and invalidation
  tagTypes: ['Post', 'User'],
  endpoints: (builder) => ({
    // Define endpoints here
    getPosts: builder.query({
      query: () => '/posts',
      // Provides these tags to the cache
      providesTags: (result = [], error, arg) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Post', id })),
              { type: 'Post', id: 'LIST' },
            ]
          : [{ type: 'Post', id: 'LIST' }],
    }),
    getPost: builder.query({
      query: (id) => `/posts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),
    addNewPost: builder.mutation({
      query: (initialPost) => ({
        url: '/posts',
        method: 'POST',
        body: initialPost,
      }),
      // Invalidates the 'LIST' tag, causing getPosts to refetch
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),
  }),
});

// -------------------------------------------------------------------------------------------
// 2. AUTO-GENERATED HOOKS
// -------------------------------------------------------------------------------------------

/**
 * RTK Query automatically generates React hooks for each endpoint.
 * Format: use[EndpointName][Query|Mutation]
 */

export const {
  useGetPostsQuery,
  useGetPostQuery,
  useAddNewPostMutation,
} = apiSlice;

// -------------------------------------------------------------------------------------------
// 3. USING QUERIES IN COMPONENTS
// -------------------------------------------------------------------------------------------

/*
function PostsList() {
  // Hooks return an object with data, status booleans, and error
  const {
    data: posts,
    isLoading,
    isSuccess,
    isError,
    error
  } = useGetPostsQuery();

  let content;

  if (isLoading) {
    content = <Spinner text="Loading..." />;
  } else if (isSuccess) {
    content = posts.map(post => <PostExcerpt key={post.id} post={post} />);
  } else if (isError) {
    content = <div>{error.toString()}</div>;
  }

  return <section>{content}</section>;
}
*/

// -------------------------------------------------------------------------------------------
// 4. USING MUTATIONS
// -------------------------------------------------------------------------------------------

/*
function AddPostForm() {
  const [addNewPost, { isLoading }] = useAddNewPostMutation();

  const onSavePostClicked = async () => {
    if (canSave) {
      try {
        // Unwrap allows you to catch errors in the component with try/catch
        await addNewPost({ title, content, user: userId }).unwrap();
        setTitle('');
        setContent('');
      } catch (err) {
        console.error('Failed to save the post: ', err);
      }
    }
  };
  // ...
}
*/

// -------------------------------------------------------------------------------------------
// 5. CACHE MANAGEMENT
// -------------------------------------------------------------------------------------------

/**
 * invalidatesTags: Used in mutations. Tells RTK Query that the cached data
 * associated with a specific tag is now stale and should be refetched.
 *
 * providesTags: Used in queries. Tells RTK Query what tags the fetched data provides.
 *
 * Example Flow:
 * 1. `getPosts` query provides tag 'Post' (list).
 * 2. `addNewPost` mutation invalidates tag 'Post' (list).
 * 3. RTK Query sees the invalidation and automatically re-runs `getPosts`.
 */

// -------------------------------------------------------------------------------------------
// 6. OPTIMISTIC UPDATES
// -------------------------------------------------------------------------------------------

/**
 * Optimistic updates update the UI immediately as if the request succeeded.
 * If it fails, the change is reverted.
 */

/*
updatePost: builder.mutation({
  query: ({ id, ...patch }) => ({
    url: `/posts/${id}`,
    method: 'PATCH',
    body: patch,
  }),
  async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
    // 1. Update the cache OPTIMISTICALLY
    const patchResult = dispatch(
      apiSlice.util.updateQueryData('getPost', id, (draft) => {
        Object.assign(draft, patch);
      })
    );
    try {
      // 2. Wait for the actual query to finish
      await queryFulfilled;
    } catch {
      // 3. If it failed, undo the optimistic update
      patchResult.undo();
    }
  },
}),
*/

// -------------------------------------------------------------------------------------------
// 7. SETUP IN STORE
// -------------------------------------------------------------------------------------------

/*
// store.js
import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './features/api/apiSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
*/

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Eliminates need for thunks/reducers for data fetching.
 * 2. Handles loading, error, and success states automatically.
 * 3. Intelligent caching prevents duplicate requests.
 * 4. Tag-based invalidation system for automatic re-fetching.
 *
 * BEST PRACTICES:
 * - Use RTK Query for ALL server-side state.
 * - Use `providesTags` and `invalidatesTags` for granular cache control.
 * - Use `transformResponse` to normalize data before it hits the cache.
 * - Centralize your API definition (one API slice per base URL).
 */
