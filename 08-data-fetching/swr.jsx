/**
 * TOPIC: SWR
 * DESCRIPTION:
 * SWR is a React hooks library for data fetching by Vercel.
 * SWR = stale-while-revalidate, showing cached data while fetching fresh.
 * npm install swr
 */

import useSWR, { useSWRConfig, mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import useSWRInfinite from 'swr/infinite';

// -------------------------------------------------------------------------------------------
// 1. BASIC USAGE
// -------------------------------------------------------------------------------------------

// Fetcher function
const fetcher = (url) => fetch(url).then((res) => res.json());

function Profile() {
  const { data, error, isLoading, isValidating } = useSWR('/api/user', fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      {isValidating && <span>Refreshing...</span>}
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 2. SWR CONFIGURATION
// -------------------------------------------------------------------------------------------

import { SWRConfig } from 'swr';

function App() {
  return (
    <SWRConfig
      value={{
        fetcher,
        refreshInterval: 3000,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 2000,
        errorRetryCount: 3,
        onError: (error) => console.error('SWR Error:', error),
      }}
    >
      <MyApp />
    </SWRConfig>
  );
}

// -------------------------------------------------------------------------------------------
// 3. CONDITIONAL FETCHING
// -------------------------------------------------------------------------------------------

function UserProfile({ userId }) {
  // Only fetch if userId exists
  const { data } = useSWR(userId ? `/api/users/${userId}` : null, fetcher);

  // Or using a function
  const { data: data2 } = useSWR(
    () => (userId ? `/api/users/${userId}` : null),
    fetcher
  );

  return <div>{data?.name}</div>;
}

// -------------------------------------------------------------------------------------------
// 4. DEPENDENT FETCHING
// -------------------------------------------------------------------------------------------

function UserProjects() {
  const { data: user } = useSWR('/api/user', fetcher);
  
  // Depends on user data
  const { data: projects } = useSWR(
    user ? `/api/users/${user.id}/projects` : null,
    fetcher
  );

  return <div>...</div>;
}

// -------------------------------------------------------------------------------------------
// 5. MUTATIONS
// -------------------------------------------------------------------------------------------

// Using mutate to update cache
function Profile() {
  const { data, mutate } = useSWR('/api/user', fetcher);

  const updateUser = async (newData) => {
    // Optimistic update
    mutate({ ...data, ...newData }, false);

    // Send request
    await fetch('/api/user', {
      method: 'PATCH',
      body: JSON.stringify(newData),
    });

    // Revalidate
    mutate();
  };

  return (
    <button onClick={() => updateUser({ name: 'New Name' })}>
      Update Name
    </button>
  );
}

// Using useSWRMutation for remote mutations
function CreatePost() {
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/posts',
    async (url, { arg }) => {
      return fetch(url, {
        method: 'POST',
        body: JSON.stringify(arg),
      }).then((res) => res.json());
    }
  );

  const handleSubmit = async (data) => {
    try {
      await trigger(data);
    } catch (e) {
      console.error('Failed to create post');
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit({ title: 'New Post' }); }}>
      <button disabled={isMutating}>Create</button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 6. OPTIMISTIC UI
// -------------------------------------------------------------------------------------------

function TodoList() {
  const { data: todos, mutate } = useSWR('/api/todos', fetcher);

  const toggleTodo = async (id, completed) => {
    // Optimistic update
    const optimisticData = todos.map((todo) =>
      todo.id === id ? { ...todo, completed } : todo
    );

    mutate(
      async () => {
        await fetch(`/api/todos/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ completed }),
        });
        return optimisticData;
      },
      {
        optimisticData,
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      }
    );
  };

  return (
    <ul>
      {todos?.map((todo) => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={(e) => toggleTodo(todo.id, e.target.checked)}
          />
          {todo.text}
        </li>
      ))}
    </ul>
  );
}

// -------------------------------------------------------------------------------------------
// 7. INFINITE LOADING
// -------------------------------------------------------------------------------------------

function InfiniteList() {
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.length) return null; // End
    return `/api/posts?page=${pageIndex + 1}`;
  };

  const { data, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher);

  const posts = data ? data.flat() : [];
  const isLoadingMore = size > 0 && data && typeof data[size - 1] === 'undefined';
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < 10);

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      <button
        onClick={() => setSize(size + 1)}
        disabled={isLoadingMore || isReachingEnd}
      >
        {isLoadingMore ? 'Loading...' : isReachingEnd ? 'No more' : 'Load More'}
      </button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 8. GLOBAL MUTATE
// -------------------------------------------------------------------------------------------

import { mutate } from 'swr';

function logoutUser() {
  // Clear user cache globally
  mutate('/api/user', null, { revalidate: false });

  // Revalidate all keys matching pattern
  mutate((key) => key.startsWith('/api/user'));
}

// -------------------------------------------------------------------------------------------
// 9. PREFETCHING
// -------------------------------------------------------------------------------------------

function prefetchUser(userId) {
  mutate(`/api/users/${userId}`, fetch(`/api/users/${userId}`).then((res) => res.json()));
}

function UserList({ users }) {
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id} onMouseEnter={() => prefetchUser(user.id)}>
          <Link to={`/users/${user.id}`}>{user.name}</Link>
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
 * 1. Stale-while-revalidate strategy
 * 2. Built-in caching and deduplication
 * 3. Focus/reconnect revalidation
 * 4. Optimistic updates
 *
 * BEST PRACTICES:
 * - Configure fetcher globally in SWRConfig
 * - Use conditional fetching with null
 * - Use optimistic updates for better UX
 * - Prefetch on hover for perceived speed
 * - Use useSWRMutation for remote mutations
 *
 * VS REACT QUERY:
 * - Simpler API
 * - Less configuration
 * - Good for simpler use cases
 * - React Query has more features
 */
