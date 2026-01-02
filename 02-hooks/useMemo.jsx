/**
 * TOPIC: useMemo HOOK
 * DESCRIPTION:
 * useMemo memoizes expensive computations, only recalculating when
 * dependencies change. It helps optimize performance by avoiding
 * unnecessary calculations on every render.
 */

import { useMemo, useState } from 'react';

// -------------------------------------------------------------------------------------------
// 1. BASIC USAGE
// -------------------------------------------------------------------------------------------

function ExpensiveComponent({ items, filter }) {
  // Only recalculates when items or filter changes
  const filteredItems = useMemo(() => {
    console.log('Filtering items...');
    return items.filter((item) => item.name.includes(filter));
  }, [items, filter]);

  return <ul>{filteredItems.map((item) => <li key={item.id}>{item.name}</li>)}</ul>;
}

// -------------------------------------------------------------------------------------------
// 2. EXPENSIVE CALCULATIONS
// -------------------------------------------------------------------------------------------

function PrimeNumbers({ max }) {
  const primes = useMemo(() => {
    console.log('Calculating primes...');
    const result = [];
    for (let n = 2; n <= max; n++) {
      let isPrime = true;
      for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) { isPrime = false; break; }
      }
      if (isPrime) result.push(n);
    }
    return result;
  }, [max]);

  return <p>Found {primes.length} primes up to {max}</p>;
}

// -------------------------------------------------------------------------------------------
// 3. REFERENTIAL EQUALITY
// -------------------------------------------------------------------------------------------

/**
 * useMemo maintains referential equality, preventing child re-renders.
 */

function ParentComponent({ data }) {
  const [count, setCount] = useState(0);

  // Without useMemo: new array every render
  // const processedData = data.map(item => ({ ...item, processed: true }));

  // With useMemo: same reference if data unchanged
  const processedData = useMemo(() => {
    return data.map((item) => ({ ...item, processed: true }));
  }, [data]);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <ChildComponent data={processedData} />
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 4. WHEN TO USE useMemo
// -------------------------------------------------------------------------------------------

/**
 * USE useMemo when:
 * - Computation is expensive (sorting, filtering large arrays)
 * - Result is passed to memoized child components
 * - Value is used as dependency in other hooks
 *
 * DON'T USE useMemo when:
 * - Computation is trivial
 * - Value is primitives (strings, numbers, booleans)
 * - Premature optimization
 */

function WhenToUse({ users, searchTerm }) {
  // GOOD: Expensive filter + sort operation
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users, searchTerm]);

  // BAD: Simple string operation (not needed)
  // const greeting = useMemo(() => `Hello, ${name}`, [name]);

  // GOOD: Creating stable object for context or props
  const contextValue = useMemo(() => ({
    users: filteredUsers,
    count: filteredUsers.length,
  }), [filteredUsers]);

  return <div>{filteredUsers.length} users</div>;
}

// -------------------------------------------------------------------------------------------
// 5. useMemo VS useCallback
// -------------------------------------------------------------------------------------------

/**
 * useMemo: Memoizes a VALUE (result of computation)
 * useCallback: Memoizes a FUNCTION
 */

function Comparison({ items }) {
  // useMemo returns the RESULT of the function
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  // useCallback returns the FUNCTION itself
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);

  // These are equivalent:
  const memoizedFn = useMemo(() => () => console.log('Hello'), []);
  const callbackFn = useCallback(() => console.log('Hello'), []);
}

// -------------------------------------------------------------------------------------------
// 6. COMMON PATTERNS
// -------------------------------------------------------------------------------------------

// Derived state
function ShoppingCart({ items }) {
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  return <p>{itemCount} items - ${total}</p>;
}

// Complex object as prop
function UserList({ users, filters }) {
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      return (
        (!filters.role || user.role === filters.role) &&
        (!filters.status || user.status === filters.status)
      );
    });
  }, [users, filters.role, filters.status]);

  return <UserGrid users={filteredUsers} />;
}

// -------------------------------------------------------------------------------------------
// 7. GOTCHAS
// -------------------------------------------------------------------------------------------

// Don't overuse - adds complexity
function Overuse() {
  const [name, setName] = useState('');

  // Unnecessary - string concat is cheap
  // const greeting = useMemo(() => `Hello, ${name}`, [name]);

  // Just do this instead
  const greeting = `Hello, ${name}`;

  return <p>{greeting}</p>;
}

// Dependencies must be complete
function IncompleteDeps({ items, config }) {
  // BAD: Missing config in dependencies
  const result = useMemo(() => {
    return items.filter((i) => i.type === config.type);
  }, [items]); // Should include config.type!

  // GOOD: All dependencies included
  const goodResult = useMemo(() => {
    return items.filter((i) => i.type === config.type);
  }, [items, config.type]);
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. useMemo caches computation results
 * 2. Only recalculates when dependencies change
 * 3. Helps with expensive operations and referential equality
 * 4. Returns the memoized VALUE
 *
 * BEST PRACTICES:
 * - Profile first, optimize where needed
 * - Use for genuinely expensive computations
 * - Use when passing objects/arrays to memoized children
 * - Include all dependencies
 * - Don't use for trivial operations
 *
 * WHEN TO USE:
 * - Filtering/sorting large arrays
 * - Complex calculations
 * - Creating objects used as hook dependencies
 * - Values passed to React.memo components
 */
