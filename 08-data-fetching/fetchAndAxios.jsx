/**
 * TOPIC: FETCH API AND AXIOS
 * DESCRIPTION:
 * Native Fetch API and Axios are common ways to make HTTP requests.
 * Learn patterns for handling loading, errors, and data in React.
 */

import { useState, useEffect } from 'react';
import axios from 'axios';

// -------------------------------------------------------------------------------------------
// 1. FETCH API BASICS
// -------------------------------------------------------------------------------------------

async function fetchUsers() {
  const response = await fetch('/api/users');
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// GET request
async function getUser(id) {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}

// POST request
async function createUser(data) {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

// PUT request
async function updateUser(id, data) {
  const res = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

// DELETE request
async function deleteUser(id) {
  const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
  return res.json();
}

// -------------------------------------------------------------------------------------------
// 2. AXIOS BASICS
// -------------------------------------------------------------------------------------------

// Create instance with defaults
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptors
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);

// CRUD operations
const userApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// -------------------------------------------------------------------------------------------
// 3. DATA FETCHING WITH useEffect
// -------------------------------------------------------------------------------------------

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await api.get('/users');
        if (isMounted) {
          setUsers(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// -------------------------------------------------------------------------------------------
// 4. CUSTOM FETCH HOOK
// -------------------------------------------------------------------------------------------

function useFetch(url, options = {}) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  const refetch = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));

    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error.message });
    }
  }, [url, options]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}

// Usage
function Users() {
  const { data, loading, error, refetch } = useFetch('/api/users');

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      <UserList users={data} />
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 5. ABORT CONTROLLER
// -------------------------------------------------------------------------------------------

function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    const search = async () => {
      try {
        const res = await fetch(`/api/search?q=${query}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setResults(data);
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Request aborted');
        } else {
          console.error('Search error:', err);
        }
      }
    };

    if (query) search();

    return () => controller.abort();
  }, [query]);

  return <ul>{results.map((r) => <li key={r.id}>{r.name}</li>)}</ul>;
}

// With Axios
function SearchWithAxios({ query }) {
  useEffect(() => {
    const source = axios.CancelToken.source();

    axios
      .get(`/api/search?q=${query}`, { cancelToken: source.token })
      .then((res) => setResults(res.data))
      .catch((err) => {
        if (!axios.isCancel(err)) console.error(err);
      });

    return () => source.cancel();
  }, [query]);
}

// -------------------------------------------------------------------------------------------
// 6. ERROR HANDLING PATTERNS
// -------------------------------------------------------------------------------------------

// Retry logic
async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res.json();
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, delay * (i + 1)));
    }
  }
}

// Error boundary for data fetching
class DataErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <button onClick={() => this.setState({ hasError: false })}>Retry</button>;
    }
    return this.props.children;
  }
}

// -------------------------------------------------------------------------------------------
// 7. PARALLEL AND SEQUENTIAL REQUESTS
// -------------------------------------------------------------------------------------------

// Parallel requests
async function fetchAllData(userId) {
  const [user, posts, comments] = await Promise.all([
    api.get(`/users/${userId}`),
    api.get(`/users/${userId}/posts`),
    api.get(`/users/${userId}/comments`),
  ]);

  return { user, posts, comments };
}

// Sequential requests
async function fetchSequentially(userId) {
  const user = await api.get(`/users/${userId}`);
  const posts = await api.get(`/posts?authorId=${user.id}`);
  const firstPostComments = await api.get(`/posts/${posts[0].id}/comments`);
  return { user, posts, firstPostComments };
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * FETCH VS AXIOS:
 * - Fetch: Native, no dependencies, requires more boilerplate
 * - Axios: More features, interceptors, better error handling
 *
 * BEST PRACTICES:
 * - Always handle loading and error states
 * - Cancel requests on component unmount
 * - Use AbortController/CancelToken
 * - Create API client with shared config
 * - Use interceptors for auth tokens
 * - Consider React Query/SWR for complex cases
 *
 * PATTERNS:
 * - Custom useFetch hook for simple cases
 * - React Query/SWR for caching needs
 * - Error boundaries for error handling
 * - Retry logic for flaky networks
 */
