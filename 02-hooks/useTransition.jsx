/**
 * TOPIC: useTransition HOOK
 * DESCRIPTION:
 * useTransition lets you mark state updates as non-urgent transitions.
 * React keeps the UI responsive during expensive renders by allowing
 * urgent updates to interrupt transition updates.
 */

import { useState, useTransition, memo } from 'react';

// -------------------------------------------------------------------------------------------
// 1. BASIC USAGE
// -------------------------------------------------------------------------------------------

/**
 * useTransition returns:
 * - isPending: boolean indicating if transition is in progress
 * - startTransition: function to wrap non-urgent updates
 */

function TabContainer() {
  const [tab, setTab] = useState('home');
  const [isPending, startTransition] = useTransition();

  function selectTab(nextTab) {
    startTransition(() => {
      // This update is marked as non-urgent
      setTab(nextTab);
    });
  }

  return (
    <div>
      <nav>
        <button onClick={() => selectTab('home')}>Home</button>
        <button onClick={() => selectTab('posts')}>Posts</button>
        <button onClick={() => selectTab('contact')}>Contact</button>
      </nav>

      {isPending && <div className="spinner">Loading...</div>}

      <div style={{ opacity: isPending ? 0.7 : 1 }}>
        {tab === 'home' && <HomeTab />}
        {tab === 'posts' && <PostsTab />}
        {tab === 'contact' && <ContactTab />}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 2. SEARCH WITH TRANSITION
// -------------------------------------------------------------------------------------------

/**
 * Keep input responsive while filtering large lists.
 */

function SearchWithTransition() {
  const [query, setQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);
  const [isPending, startTransition] = useTransition();

  function handleChange(e) {
    const value = e.target.value;

    // Urgent: Update input immediately
    setQuery(value);

    // Non-urgent: Filter list (can be interrupted)
    startTransition(() => {
      const filtered = items.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredItems(filtered);
    });
  }

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={handleChange}
        placeholder="Search..."
      />

      {isPending && <span>Updating list...</span>}

      <ul style={{ opacity: isPending ? 0.7 : 1 }}>
        {filteredItems.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 3. NAVIGATION WITH TRANSITION
// -------------------------------------------------------------------------------------------

function Router() {
  const [page, setPage] = useState('/');
  const [isPending, startTransition] = useTransition();

  function navigate(url) {
    startTransition(() => {
      setPage(url);
    });
  }

  return (
    <div>
      <nav>
        <a href="#" onClick={() => navigate('/')}>Home</a>
        <a href="#" onClick={() => navigate('/about')}>About</a>
        <a href="#" onClick={() => navigate('/dashboard')}>Dashboard</a>
      </nav>

      {isPending ? (
        <div className="page-loading">Navigating...</div>
      ) : (
        <PageContent page={page} />
      )}
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 4. FORM SUBMISSION WITH TRANSITION
// -------------------------------------------------------------------------------------------

function FormWithTransition() {
  const [data, setData] = useState(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData) {
    startTransition(async () => {
      const result = await submitForm(formData);
      setData(result);
    });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.target)); }}>
      <input name="email" type="email" required />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 5. EXPENSIVE RENDER WITH TRANSITION
// -------------------------------------------------------------------------------------------

const SlowList = memo(function SlowList({ text }) {
  const items = [];
  for (let i = 0; i < 500; i++) {
    items.push(<SlowItem key={i} text={text} />);
  }
  return <ul>{items}</ul>;
});

function SlowItem({ text }) {
  // Artificial slowdown
  const startTime = performance.now();
  while (performance.now() - startTime < 1) {}
  return <li>Item: {text}</li>;
}

function App() {
  const [text, setText] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleChange(e) {
    // Urgent: Keep input responsive
    const value = e.target.value;

    startTransition(() => {
      setText(value);
    });
  }

  return (
    <div>
      <input onChange={handleChange} />
      <div style={{ opacity: isPending ? 0.5 : 1 }}>
        <SlowList text={text} />
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 6. startTransition WITHOUT isPending
// -------------------------------------------------------------------------------------------

/**
 * Use standalone startTransition when you don't need isPending.
 */

import { startTransition } from 'react';

function QuickTransition() {
  const [value, setValue] = useState('');

  function handleChange(e) {
    startTransition(() => {
      setValue(e.target.value);
    });
  }

  return <input onChange={handleChange} />;
}

// -------------------------------------------------------------------------------------------
// 7. TRANSITION VS DEBOUNCE
// -------------------------------------------------------------------------------------------

/**
 * DEBOUNCE: Delays the update
 * TRANSITION: Starts immediately but can be interrupted
 *
 * Transitions are better for:
 * - Immediate visual feedback
 * - Interruptible updates
 * - Concurrent rendering benefits
 */

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Marks updates as non-urgent
 * 2. Keeps UI responsive during heavy renders
 * 3. isPending for loading states
 * 4. Works with Suspense
 *
 * USE CASES:
 * - Tab switching
 * - Filtering large lists
 * - Navigation
 * - Non-critical state updates
 *
 * BEST PRACTICES:
 * - Use for expensive re-renders
 * - Show visual feedback with isPending
 * - Don't use for controlled inputs directly
 * - Combine with memo for best results
 */
