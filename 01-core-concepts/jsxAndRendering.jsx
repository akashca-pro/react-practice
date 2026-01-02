/**
 * TOPIC: JSX AND RENDERING
 * DESCRIPTION:
 * JSX is a syntax extension for JavaScript that looks similar to HTML.
 * It allows you to write UI elements in a familiar format while leveraging
 * the full power of JavaScript. Understanding JSX and how React renders
 * components is fundamental to building React applications.
 */

// -------------------------------------------------------------------------------------------
// 1. JSX BASICS
// -------------------------------------------------------------------------------------------

/**
 * JSX is syntactic sugar for React.createElement() calls.
 * Babel transforms JSX into regular JavaScript function calls.
 */

// JSX syntax
const element = <h1>Hello, World!</h1>;

// Equivalent JavaScript (what Babel compiles to)
const elementJS = React.createElement('h1', null, 'Hello, World!');

/**
 * JSX RULES:
 * 1. Must return a single root element (use fragments for multiple)
 * 2. All tags must be closed (including self-closing tags)
 * 3. Use camelCase for most HTML attributes (className, onClick, etc.)
 * 4. JavaScript expressions go inside curly braces {}
 */

// -------------------------------------------------------------------------------------------
// 2. EMBEDDING EXPRESSIONS IN JSX
// -------------------------------------------------------------------------------------------

/**
 * You can embed any valid JavaScript expression inside curly braces {} in JSX.
 * Expressions are evaluated and their results are rendered.
 */

const name = 'Akash';
const greeting = <h1>Hello, {name}!</h1>;

// Function calls
const formatName = (user) => `${user.firstName} ${user.lastName}`;
const user = { firstName: 'John', lastName: 'Doe' };
const userGreeting = <h1>Hello, {formatName(user)}!</h1>;

// Arithmetic expressions
const mathResult = <p>2 + 2 = {2 + 2}</p>;

// Ternary operators (conditional expressions)
const isLoggedIn = true;
const loginStatus = <p>{isLoggedIn ? 'Welcome back!' : 'Please log in'}</p>;

// Object property access
const product = { name: 'Laptop', price: 999 };
const productDisplay = <p>{product.name}: ${product.price}</p>;

// -------------------------------------------------------------------------------------------
// 3. JSX ATTRIBUTES
// -------------------------------------------------------------------------------------------

/**
 * JSX uses camelCase for attribute names because JSX is closer to JavaScript
 * than HTML. Some attributes have different names in JSX.
 */

// className instead of class
const styledDiv = <div className="container">Content</div>;

// htmlFor instead of for
const label = <label htmlFor="email">Email</label>;

// Style as an object with camelCase properties
const inlineStyle = (
  <div style={{ backgroundColor: 'blue', fontSize: '16px', marginTop: '10px' }}>
    Styled content
  </div>
);

// Boolean attributes
const disabledInput = <input disabled />;
const checkedBox = <input type="checkbox" checked={true} />;

// Spread attributes (passing all props)
const props = { id: 'myInput', type: 'text', placeholder: 'Enter text' };
const inputWithSpread = <input {...props} />;

// Data attributes (keep lowercase)
const dataAttr = <div data-testid="my-element" data-user-id="123">Content</div>;

// -------------------------------------------------------------------------------------------
// 4. REACT FRAGMENTS
// -------------------------------------------------------------------------------------------

/**
 * Fragments let you group elements without adding extra nodes to the DOM.
 * Useful when a component needs to return multiple elements.
 */

import React, { Fragment } from 'react';

// Long syntax
function LongFragment() {
  return (
    <Fragment>
      <h1>Title</h1>
      <p>Paragraph</p>
    </Fragment>
  );
}

// Short syntax (most common)
function ShortFragment() {
  return (
    <>
      <h1>Title</h1>
      <p>Paragraph</p>
    </>
  );
}

// Fragment with key (required in lists)
function ListWithFragments({ items }) {
  return (
    <>
      {items.map((item) => (
        <Fragment key={item.id}>
          <dt>{item.term}</dt>
          <dd>{item.description}</dd>
        </Fragment>
      ))}
    </>
  );
}

// -------------------------------------------------------------------------------------------
// 5. VIRTUAL DOM AND RECONCILIATION
// -------------------------------------------------------------------------------------------

/**
 * React uses a Virtual DOM to optimize rendering performance.
 * 
 * HOW IT WORKS:
 * 1. React creates a lightweight copy of the DOM (Virtual DOM)
 * 2. When state changes, React creates a new Virtual DOM tree
 * 3. React compares (diffs) the new tree with the previous one
 * 4. Only the changed elements are updated in the real DOM
 * 
 * This process is called RECONCILIATION.
 */

/**
 * RECONCILIATION ALGORITHM (Diffing):
 * 
 * 1. Different element types → Rebuild entire subtree
 *    <div> → <span> = Destroy div and all children, create span
 * 
 * 2. Same element type → Update only changed attributes
 *    <div className="old"> → <div className="new">
 *    Only className attribute is updated
 * 
 * 3. Component elements → Re-render with new props
 *    Instance is preserved, state is maintained
 * 
 * 4. Recursing on children → Uses keys for optimization
 *    Keys help React identify which items changed/moved
 */

// Example: Inefficient without keys (all items re-rendered)
function BadList({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li>{item}</li> // Missing key!
      ))}
    </ul>
  );
}

// Example: Efficient with keys (only changed items updated)
function GoodList({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

// -------------------------------------------------------------------------------------------
// 6. RENDERING ELEMENTS TO THE DOM
// -------------------------------------------------------------------------------------------

/**
 * React applications have a single "root" DOM node.
 * Everything inside this node is managed by React DOM.
 */

import { createRoot } from 'react-dom/client';

// React 18+ syntax
const container = document.getElementById('root');
const root = createRoot(container);

// Render a React element
root.render(<App />);

/**
 * ROOT NODE:
 * - Usually a <div id="root"></div> in your HTML
 * - React takes control of everything inside this element
 * - You can have multiple roots on a page (rare, but possible)
 */

// Multiple roots (uncommon, but sometimes needed for gradual migration)
const sidebar = createRoot(document.getElementById('sidebar'));
sidebar.render(<Sidebar />);

const main = createRoot(document.getElementById('main'));
main.render(<MainContent />);

// -------------------------------------------------------------------------------------------
// 7. JSX PREVENTS INJECTION ATTACKS
// -------------------------------------------------------------------------------------------

/**
 * React DOM escapes any values embedded in JSX before rendering.
 * This prevents XSS (Cross-Site Scripting) attacks.
 */

// This is safe - the script tag is rendered as text, not executed
const userInput = '<script>alert("hacked!")</script>';
const safeElement = <div>{userInput}</div>;
// Renders: <div>&lt;script&gt;alert("hacked!")&lt;/script&gt;</div>

/**
 * dangerouslySetInnerHTML:
 * If you truly need to render raw HTML, use this prop.
 * Only use with trusted, sanitized content!
 */
function RawHTML() {
  const htmlString = '<strong>Bold text</strong>';
  return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
}

// -------------------------------------------------------------------------------------------
// 8. CONDITIONAL RENDERING IN JSX
// -------------------------------------------------------------------------------------------

/**
 * Multiple patterns for rendering content conditionally.
 */

// Pattern 1: Ternary operator (if-else)
function Greeting({ isLoggedIn }) {
  return <h1>{isLoggedIn ? 'Welcome back!' : 'Please sign in'}</h1>;
}

// Pattern 2: Logical && operator (if only)
function Mailbox({ unreadMessages }) {
  return (
    <div>
      <h1>Messages</h1>
      {unreadMessages.length > 0 && (
        <p>You have {unreadMessages.length} unread messages.</p>
      )}
    </div>
  );
}

// Pattern 3: Early return
function WelcomeMessage({ user }) {
  if (!user) {
    return <p>Please log in</p>;
  }
  return <p>Welcome, {user.name}!</p>;
}

// Pattern 4: IIFE for complex logic (avoid if possible)
function ComplexCondition({ status }) {
  return (
    <div>
      {(() => {
        switch (status) {
          case 'loading':
            return <Spinner />;
          case 'error':
            return <Error />;
          case 'success':
            return <Content />;
          default:
            return null;
        }
      })()}
    </div>
  );
}

// Pattern 5: Extracted component (cleanest for complex logic)
function StatusDisplay({ status }) {
  const statusComponents = {
    loading: <Spinner />,
    error: <Error />,
    success: <Content />,
  };
  return statusComponents[status] || null;
}

// -------------------------------------------------------------------------------------------
// 9. LISTS AND KEYS
// -------------------------------------------------------------------------------------------

/**
 * Keys help React identify which items have changed, been added, or removed.
 * Keys should be stable, unique, and predictable.
 */

// Good: Using unique IDs as keys
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}

// Avoid: Using array index as key (problematic with reordering)
function BadTodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo, index) => (
        // Don't do this if the list can be reordered or filtered
        <li key={index}>{todo.text}</li>
      ))}
    </ul>
  );
}

/**
 * WHEN INDEX AS KEY IS OK:
 * 1. List is static (never reordered or filtered)
 * 2. Items have no stable IDs
 * 3. List is never reused
 */

// Keys must be unique among siblings, not globally
function Blog({ posts }) {
  return (
    <div>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          {post.comments.map((comment) => (
            // This key only needs to be unique within this article's comments
            <p key={comment.id}>{comment.text}</p>
          ))}
        </article>
      ))}
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 10. JSX TRANSFORM (REACT 17+)
// -------------------------------------------------------------------------------------------

/**
 * React 17 introduced a new JSX transform.
 * You no longer need to import React to use JSX.
 */

// Old way (React 16 and earlier)
// import React from 'react';
// 
// function App() {
//   return <h1>Hello</h1>;
// }

// New way (React 17+)
// No import needed for JSX!
function App() {
  return <h1>Hello</h1>;
}

/**
 * The new transform:
 * - Smaller bundle size (React import not needed everywhere)
 * - Future improvements possible without breaking changes
 * - Babel/TypeScript automatically handles the transformation
 */

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * JSX AND RENDERING KEY POINTS:
 *
 * 1. JSX is syntactic sugar for React.createElement()
 * 2. Use {} to embed JavaScript expressions
 * 3. Attributes use camelCase (className, htmlFor, onClick)
 * 4. Use Fragments to avoid unnecessary wrapper elements
 * 5. React escapes values in JSX to prevent XSS attacks
 * 6. Virtual DOM enables efficient updates through reconciliation
 *
 * BEST PRACTICES:
 * - Always provide stable, unique keys for list items
 * - Avoid using array index as key when list can change
 * - Use Fragments to keep DOM clean
 * - Extract complex conditional rendering into separate components
 * - Never use dangerouslySetInnerHTML with untrusted content
 * - Keep JSX readable - extract complex expressions to variables
 * - Use the new JSX transform (React 17+) for cleaner imports
 *
 * PERFORMANCE CONSIDERATIONS:
 * - Keys help React minimize DOM operations
 * - Stable component structure prevents unnecessary unmounting
 * - Avoid creating new objects/arrays in JSX (move to variables)
 */
