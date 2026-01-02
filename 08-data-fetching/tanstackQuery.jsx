/**
 * TOPIC: TANSTACK QUERY (REACT QUERY)
 * DESCRIPTION:
 * TanStack Query is a powerful data fetching and caching library.
 * It handles loading, error states, caching, and background updates.
 * npm install @tanstack/react-query
 */

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';

// -------------------------------------------------------------------------------------------
// 1. SETUP
// -------------------------------------------------------------------------------------------

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 3,
      refetchOnWindowFocus: true,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MyComponent />
    </QueryClientProvider>
  );
}

// -------------------------------------------------------------------------------------------
// 2. BASIC QUERY
// -------------------------------------------------------------------------------------------

function UserProfile({ userId }) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then((res) => res.json()),
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 3. QUERY OPTIONS
// -------------------------------------------------------------------------------------------

function Posts({ enabled }) {
  const { data, isFetching } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,

    // Caching
    staleTime: 1000 * 60, // Data considered fresh for 1 min
    cacheTime: 1000 * 60 * 5, // Keep in cache for 5 min

    // Refetching
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 30, // Poll every 30 seconds

    // Control
    enabled: enabled, // Only fetch if true
    retry: 3,
    retryDelay: 1000,

    // Callbacks
    onSuccess: (data) => console.log('Fetched:', data),
    onError: (error) => console.error('Error:', error),

    // Transformations
    select: (data) => data.filter((post) => post.published),

    // Initial data
    initialData: [],
    placeholderData: [],
  });

  return <div>...</div>;
}

// -------------------------------------------------------------------------------------------
// 4. DEPENDENT QUERIES
// -------------------------------------------------------------------------------------------

function UserPosts({ userId }) {
  // First query
  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  // Second query depends on first
  const postsQuery = useQuery({
    queryKey: ['posts', userQuery.data?.id],
    queryFn: () => fetchPostsByUser(userQuery.data.id),
    enabled: !!userQuery.data?.id, // Only run when user is loaded
  });

  return <div>...</div>;
}

// -------------------------------------------------------------------------------------------
// 5. MUTATIONS
// -------------------------------------------------------------------------------------------

function CreatePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newPost) =>
      fetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify(newPost),
      }).then((res) => res.json()),

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },

    onError: (error) => {
      console.error('Failed to create post:', error);
    },

    onSettled: () => {
      // Always runs after mutation
    },
  });

  const handleSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {mutation.isLoading && <span>Creating...</span>}
      {mutation.isError && <span>Error: {mutation.error.message}</span>}
      {mutation.isSuccess && <span>Post created!</span>}
      <button type="submit" disabled={mutation.isLoading}>
        Create Post
      </button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 6. OPTIMISTIC UPDATES
// -------------------------------------------------------------------------------------------

function TodoItem({ todo }) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: (completed) =>
      fetch(`/api/todos/${todo.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed }),
      }),

    // Optimistic update
    onMutate: async (newCompleted) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData(['todos']);

      // Optimistically update
      queryClient.setQueryData(['todos'], (old) =>
        old.map((t) =>
          t.id === todo.id ? { ...t, completed: newCompleted } : t
        )
      );

      return { previousTodos };
    },

    // Rollback on error
    onError: (err, newCompleted, context) => {
      queryClient.setQueryData(['todos'], context.previousTodos);
    },

    // Refetch after success or error
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  return (
    <input
      type="checkbox"
      checked={todo.completed}
      onChange={(e) => toggleMutation.mutate(e.target.checked)}
    />
  );
}

// -------------------------------------------------------------------------------------------
// 7. INFINITE QUERIES
// -------------------------------------------------------------------------------------------

function InfinitePostList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam = 1 }) =>
      fetch(`/api/posts?page=${pageParam}`).then((res) => res.json()),
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  });

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ))}

      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage
          ? 'Loading more...'
          : hasNextPage
          ? 'Load More'
          : 'No more posts'}
      </button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 8. PREFETCHING
// -------------------------------------------------------------------------------------------

function PostList() {
  const queryClient = useQueryClient();

  const prefetchPost = (postId) => {
    queryClient.prefetchQuery({
      queryKey: ['post', postId],
      queryFn: () => fetchPost(postId),
      staleTime: 1000 * 60 * 5,
    });
  };

  return (
    <ul>
      {posts.map((post) => (
        <li
          key={post.id}
          onMouseEnter={() => prefetchPost(post.id)}
        >
          <Link to={`/posts/${post.id}`}>{post.title}</Link>
        </li>
      ))}
    </ul>
  );
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY FEATURES:
 * 1. Automatic caching and refetching
 * 2. Loading and error states
 * 3. Optimistic updates
 * 4. Infinite scroll support
 *
 * BEST PRACTICES:
 * - Use meaningful query keys
 * - Set appropriate staleTime
 * - Use invalidateQueries after mutations
 * - Implement optimistic updates for better UX
 * - Prefetch on hover for better performance
 *
 * QUERY KEY PATTERNS:
 * ['todos']
 * ['todos', { status: 'done' }]
 * ['todos', todoId]
 * ['user', userId, 'posts']
 */
