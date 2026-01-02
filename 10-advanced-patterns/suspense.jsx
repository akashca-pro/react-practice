/**
 * TOPIC: SUSPENSE AND CONCURRENT FEATURES
 * DESCRIPTION:
 * Suspense enables declarative loading states. Combined with React 18's
 * concurrent features, it allows for better UX with streaming, transitions,
 * and prioritized rendering.
 */

import {
  Suspense,
  lazy,
  startTransition,
  useTransition,
  useDeferredValue,
  use,
} from 'react';

// -------------------------------------------------------------------------------------------
// 1. SUSPENSE FOR LAZY LOADING
// -------------------------------------------------------------------------------------------

const LazyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}

// Nested Suspense boundaries
function Dashboard() {
  return (
    <div>
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>
      <Suspense fallback={<ContentSkeleton />}>
        <Content />
      </Suspense>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 2. SUSPENSE FOR DATA FETCHING
// -------------------------------------------------------------------------------------------

/**
 * Suspense for data fetching (React 18+).
 * Works with libraries that support it (React Query, Relay, etc.)
 */

function UserProfile({ userId }) {
  // The use() hook suspends while fetching
  const user = use(fetchUser(userId));
  return <div>{user.name}</div>;
}

function App() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <UserProfile userId={1} />
    </Suspense>
  );
}

// Cache for Suspense-compatible fetch
const cache = new Map();

function fetchWithSuspense(url) {
  if (!cache.has(url)) {
    cache.set(url, createResource(fetch(url).then(r => r.json())));
  }
  return cache.get(url);
}

function createResource(promise) {
  let status = 'pending';
  let result;
  const suspender = promise.then(
    (data) => { status = 'success'; result = data; },
    (error) => { status = 'error'; result = error; }
  );
  return {
    read() {
      if (status === 'pending') throw suspender;
      if (status === 'error') throw result;
      return result;
    },
  };
}

// -------------------------------------------------------------------------------------------
// 3. TRANSITIONS
// -------------------------------------------------------------------------------------------

/**
 * startTransition marks updates as non-urgent.
 * UI stays responsive during heavy renders.
 */

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value); // Urgent: Update input immediately

    startTransition(() => {
      // Non-urgent: Can be interrupted
      setResults(searchDatabase(value));
    });
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <span>Loading...</span>}
      <ResultsList results={results} />
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 4. DEFERRED VALUES
// -------------------------------------------------------------------------------------------

/**
 * useDeferredValue defers updating a value until urgent updates complete.
 * Good for expensive renders that shouldn't block input.
 */

function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  const results = useMemo(
    () => heavySearch(deferredQuery),
    [deferredQuery]
  );

  return (
    <div style={{ opacity: isStale ? 0.5 : 1 }}>
      {results.map((r) => <ResultItem key={r.id} result={r} />)}
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 5. SUSPENSE WITH TRANSITIONS
// -------------------------------------------------------------------------------------------

function TabContainer() {
  const [tab, setTab] = useState('home');
  const [isPending, startTransition] = useTransition();

  const selectTab = (nextTab) => {
    startTransition(() => {
      setTab(nextTab);
    });
  };

  return (
    <div>
      <TabButtons
        activeTab={tab}
        onSelect={selectTab}
        isPending={isPending}
      />
      <Suspense fallback={<TabSkeleton />}>
        {/* Suspense content */}
        {tab === 'home' && <HomeTab />}
        {tab === 'posts' && <PostsTab />}
        {tab === 'settings' && <SettingsTab />}
      </Suspense>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 6. SUSPENSE LIST (EXPERIMENTAL)
// -------------------------------------------------------------------------------------------

/**
 * SuspenseList coordinates multiple Suspense boundaries.
 */

import { SuspenseList } from 'react';

function Feed() {
  return (
    <SuspenseList revealOrder="forwards" tail="collapsed">
      <Suspense fallback={<PostSkeleton />}>
        <Post id={1} />
      </Suspense>
      <Suspense fallback={<PostSkeleton />}>
        <Post id={2} />
      </Suspense>
      <Suspense fallback={<PostSkeleton />}>
        <Post id={3} />
      </Suspense>
    </SuspenseList>
  );
}

// revealOrder: 'forwards' | 'backwards' | 'together'
// tail: 'collapsed' | 'hidden'

// -------------------------------------------------------------------------------------------
// 7. ERROR BOUNDARIES WITH SUSPENSE
// -------------------------------------------------------------------------------------------

function DataSection() {
  return (
    <ErrorBoundary fallback={<ErrorMessage />}>
      <Suspense fallback={<Loading />}>
        <AsyncComponent />
      </Suspense>
    </ErrorBoundary>
  );
}

// -------------------------------------------------------------------------------------------
// 8. STREAMING SSR
// -------------------------------------------------------------------------------------------

/**
 * With React 18 and Suspense, SSR can stream HTML progressively.
 * - Initial shell renders immediately
 * - Suspended content streams as it resolves
 * - Selective hydration prioritizes user interactions
 */

// server.js (simplified)
import { renderToPipeableStream } from 'react-dom/server';

app.get('/', (req, res) => {
  const { pipe } = renderToPipeableStream(<App />, {
    bootstrapScripts: ['/main.js'],
    onShellReady() {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      pipe(res);
    },
  });
});

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY CONCEPTS:
 * 1. Suspense: Declarative loading states
 * 2. Transitions: Non-blocking updates
 * 3. Deferred values: Prioritize urgent updates
 * 4. Streaming SSR: Progressive rendering
 *
 * BEST PRACTICES:
 * - Use multiple Suspense boundaries
 * - Wrap heavy state updates in transitions
 * - Use useDeferredValue for expensive renders
 * - Combine Error Boundaries with Suspense
 *
 * REQUIREMENTS:
 * - React 18+ for concurrent features
 * - Library support for data Suspense
 * - Streaming SSR requires compatible server
 */
