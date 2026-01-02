/**
 * TOPIC: useDeferredValue HOOK
 * DESCRIPTION:
 * useDeferredValue lets you defer updating a part of the UI.
 * It's similar to debouncing but integrated with React's
 * concurrent rendering for better user experience.
 */

import { useState, useDeferredValue, useMemo, memo } from 'react';

// -------------------------------------------------------------------------------------------
// 1. BASIC USAGE
// -------------------------------------------------------------------------------------------

/**
 * useDeferredValue accepts a value and returns a "deferred" version.
 * The deferred value lags behind during urgent updates.
 */

function SearchPage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {/* SearchResults uses the deferred value */}
      <SearchResults query={deferredQuery} />
    </div>
  );
}

const SearchResults = memo(function SearchResults({ query }) {
  // Expensive filtering/rendering
  const results = useMemo(() => {
    return allItems.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <ul>
      {results.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
});

// -------------------------------------------------------------------------------------------
// 2. SHOWING STALE CONTENT
// -------------------------------------------------------------------------------------------

function DeferredList() {
  const [text, setText] = useState('');
  const deferredText = useDeferredValue(text);

  // Detect if showing stale content
  const isStale = text !== deferredText;

  return (
    <div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div style={{
        opacity: isStale ? 0.5 : 1,
        transition: 'opacity 0.2s',
      }}>
        <SlowList text={deferredText} />
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 3. EXPENSIVE COMPUTATION
// -------------------------------------------------------------------------------------------

function ExpensiveVisualization({ data }) {
  const deferredData = useDeferredValue(data);
  const isStale = data !== deferredData;

  // Only recompute when deferred value changes
  const chart = useMemo(() => {
    return computeExpensiveChart(deferredData);
  }, [deferredData]);

  return (
    <div className={isStale ? 'stale' : ''}>
      {chart}
    </div>
  );
}

function Dashboard() {
  const [filter, setFilter] = useState({});
  const [data, setData] = useState([]);

  return (
    <div>
      <FilterPanel filter={filter} onChange={setFilter} />
      <ExpensiveVisualization data={data} />
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 4. DEFERRING CHILD COMPONENT PROPS
// -------------------------------------------------------------------------------------------

function ParentComponent() {
  const [value, setValue] = useState('');
  const deferredValue = useDeferredValue(value);

  return (
    <div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {/* Pass deferred value to child */}
      <SlowChild value={deferredValue} />
    </div>
  );
}

const SlowChild = memo(function SlowChild({ value }) {
  // Expensive rendering
  const items = [];
  for (let i = 0; i < 250; i++) {
    items.push(<ExpensiveItem key={i} value={value} />);
  }
  return <div>{items}</div>;
});

// -------------------------------------------------------------------------------------------
// 5. WITH SUSPENSE
// -------------------------------------------------------------------------------------------

/**
 * useDeferredValue works great with Suspense.
 * Shows stale content while new content loads.
 */

function SearchWithSuspense() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Suspense fallback={<Loading />}>
        <div style={{ opacity: isStale ? 0.7 : 1 }}>
          <SearchResults query={deferredQuery} />
        </div>
      </Suspense>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 6. useDeferredValue VS useTransition
// -------------------------------------------------------------------------------------------

/**
 * useDeferredValue:
 * - Defers the value itself
 * - Good when you can't control the state update
 * - Works with values from props or external sources
 *
 * useTransition:
 * - Wraps the state update
 * - Provides isPending flag
 * - Good when you control the state update
 */

// When state is controlled by you - use useTransition
function WithTransition() {
  const [tab, setTab] = useState('home');
  const [isPending, startTransition] = useTransition();

  function selectTab(nextTab) {
    startTransition(() => {
      setTab(nextTab);
    });
  }

  return <div>...</div>;
}

// When value comes from props - use useDeferredValue
function WithDeferredValue({ searchQuery }) {
  const deferredQuery = useDeferredValue(searchQuery);
  return <Results query={deferredQuery} />;
}

// -------------------------------------------------------------------------------------------
// 7. INITIAL VALUE
// -------------------------------------------------------------------------------------------

/**
 * On initial render, deferred value equals the original value.
 * It only "lags behind" during subsequent updates.
 */

function InitialValueDemo() {
  const [value, setValue] = useState('initial');
  const deferredValue = useDeferredValue(value);

  console.log('Current:', value);
  console.log('Deferred:', deferredValue);
  // On first render, both are 'initial'

  return <div>...</div>;
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Defers updating a value to keep UI responsive
 * 2. Returns "stale" value during updates
 * 3. Works with memo to skip expensive re-renders
 * 4. Integrates with Suspense
 *
 * USE CASES:
 * - Filtering large lists
 * - Expensive visualizations
 * - Values from external sources
 * - Keeping inputs responsive
 *
 * BEST PRACTICES:
 * - Combine with memo for child components
 * - Show visual feedback for stale content
 * - Use useTransition when you control the update
 * - Use useDeferredValue for external values
 */
