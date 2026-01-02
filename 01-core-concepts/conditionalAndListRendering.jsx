/**
 * TOPIC: CONDITIONAL AND LIST RENDERING
 * DESCRIPTION:
 * React allows you to conditionally render components and efficiently
 * render lists of data. These patterns are essential for building
 * dynamic UIs that respond to application state.
 */

// -------------------------------------------------------------------------------------------
// 1. CONDITIONAL RENDERING PATTERNS
// -------------------------------------------------------------------------------------------

/**
 * Pattern 1: Ternary Operator (if-else)
 * Best for: rendering one of two elements
 */
function Greeting({ isLoggedIn }) {
  return <h1>{isLoggedIn ? 'Welcome back!' : 'Please sign in'}</h1>;
}

/**
 * Pattern 2: Logical AND (&&)
 * Best for: render something or nothing
 */
function Notification({ messages }) {
  return (
    <div>
      {messages.length > 0 && <p>You have {messages.length} new messages</p>}
    </div>
  );
}

// GOTCHA: Avoid 0 being rendered
function BadExample({ count }) {
  // If count is 0, renders "0" instead of nothing!
  return <div>{count && <p>Count: {count}</p>}</div>;
}

function GoodExample({ count }) {
  return <div>{count > 0 && <p>Count: {count}</p>}</div>;
}

/**
 * Pattern 3: Early Return
 * Best for: guard clauses, loading/error states
 */
function UserProfile({ user, isLoading, error }) {
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <p>No user found</p>;

  return <div><h1>{user.name}</h1></div>;
}

/**
 * Pattern 4: Component Mapping Object
 * Best for: multiple conditions (switch-like)
 */
function StatusBadge({ status }) {
  const badges = {
    pending: <span className="badge yellow">Pending</span>,
    approved: <span className="badge green">Approved</span>,
    rejected: <span className="badge red">Rejected</span>,
  };
  return badges[status] || <span className="badge gray">Unknown</span>;
}

/**
 * Pattern 5: Null for hiding
 * Return null to render nothing
 */
function HiddenWarning({ show }) {
  if (!show) return null;
  return <div className="warning">Warning!</div>;
}

// -------------------------------------------------------------------------------------------
// 2. LIST RENDERING WITH MAP
// -------------------------------------------------------------------------------------------

/**
 * Use .map() to transform arrays into elements.
 * Always provide a unique key prop.
 */

function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}

// Rendering objects
function UserList({ users }) {
  return (
    <div className="user-grid">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}

// Rendering with index (use carefully)
function StaticList({ items }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li> // OK for static lists only
      ))}
    </ul>
  );
}

// -------------------------------------------------------------------------------------------
// 3. KEYS IN REACT
// -------------------------------------------------------------------------------------------

/**
 * Keys help React identify which items changed, added, or removed.
 * Keys must be stable, unique among siblings, and predictable.
 */

// GOOD: Stable unique IDs
function GoodKeys({ items }) {
  return items.map((item) => <Item key={item.id} {...item} />);
}

// BAD: Index keys with dynamic lists
function BadKeys({ items }) {
  return items.map((item, index) => <Item key={index} {...item} />);
}

// GENERATING KEYS
// Use database IDs, UUIDs, or combination of unique properties
function GenerateKeys({ items }) {
  return items.map((item) => (
    <Item key={`${item.category}-${item.name}`} {...item} />
  ));
}

/**
 * WHY KEYS MATTER:
 * Without proper keys, React may:
 * - Reuse wrong component instances
 * - Lose component state
 * - Cause incorrect animations
 * - Perform inefficient updates
 */

// -------------------------------------------------------------------------------------------
// 4. NESTED LISTS
// -------------------------------------------------------------------------------------------

function CommentThread({ comments }) {
  return (
    <ul>
      {comments.map((comment) => (
        <li key={comment.id}>
          <p>{comment.text}</p>
          {comment.replies && (
            <ul>
              {comment.replies.map((reply) => (
                <li key={reply.id}>{reply.text}</li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

// -------------------------------------------------------------------------------------------
// 5. FILTERING AND TRANSFORMING LISTS
// -------------------------------------------------------------------------------------------

function FilteredList({ products, category, searchTerm }) {
  const filtered = products
    .filter((p) => category === 'all' || p.category === category)
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (filtered.length === 0) {
    return <p>No products found</p>;
  }

  return (
    <ul>
      {filtered.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ul>
  );
}

// -------------------------------------------------------------------------------------------
// 6. FRAGMENTS IN LISTS
// -------------------------------------------------------------------------------------------

import { Fragment } from 'react';

function DefinitionList({ terms }) {
  return (
    <dl>
      {terms.map((term) => (
        <Fragment key={term.id}>
          <dt>{term.name}</dt>
          <dd>{term.definition}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

// -------------------------------------------------------------------------------------------
// 7. EMPTY STATE HANDLING
// -------------------------------------------------------------------------------------------

function ProductList({ products, isLoading }) {
  if (isLoading) return <LoadingSkeleton count={6} />;
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <h3>No products found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * CONDITIONAL RENDERING:
 * - Ternary (? :) for if-else
 * - && for if-only (watch out for 0!)
 * - Early return for guard clauses
 * - Object mapping for switch-like conditions
 *
 * LIST RENDERING:
 * - Use .map() to transform arrays
 * - Always provide unique, stable keys
 * - Avoid index as key for dynamic lists
 * - Handle empty states gracefully
 *
 * BEST PRACTICES:
 * - Use database IDs as keys when available
 * - Extract list items into separate components
 * - Filter/sort data before rendering
 * - Use Fragments when mapping without wrapper elements
 */
