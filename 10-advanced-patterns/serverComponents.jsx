/**
 * TOPIC: SERVER COMPONENTS
 * DESCRIPTION:
 * React Server Components (RSC) run on the server and send HTML to the
 * client. They enable zero-bundle-size components, direct database access,
 * and improved initial load performance. Requires Next.js 13+ or similar.
 */

// -------------------------------------------------------------------------------------------
// 1. SERVER VS CLIENT COMPONENTS
// -------------------------------------------------------------------------------------------

/**
 * SERVER COMPONENTS (default in Next.js 13+ app directory):
 * - Run only on the server
 * - No JavaScript sent to client
 * - Can access backend directly
 * - Cannot use hooks or browser APIs
 * - Cannot have event handlers
 *
 * CLIENT COMPONENTS:
 * - Run on client (and server for SSR)
 * - Include JavaScript bundle
 * - Can use hooks, state, effects
 * - Can handle user interactions
 */

// Server Component (default)
async function ProductList() {
  // Direct database access - no API needed!
  const products = await db.query('SELECT * FROM products');

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}

// Client Component (add 'use client' directive)
'use client';

import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// -------------------------------------------------------------------------------------------
// 2. MARKING CLIENT COMPONENTS
// -------------------------------------------------------------------------------------------

/**
 * Add 'use client' at the top of the file to make it a Client Component.
 * This creates a "boundary" - all imports become client components too.
 */

// components/InteractiveButton.jsx
'use client';

import { useState } from 'react';

export function InteractiveButton({ children }) {
  const [clicked, setClicked] = useState(false);

  return (
    <button onClick={() => setClicked(true)}>
      {clicked ? 'Clicked!' : children}
    </button>
  );
}

// -------------------------------------------------------------------------------------------
// 3. COMPOSING SERVER AND CLIENT COMPONENTS
// -------------------------------------------------------------------------------------------

// Server Component (parent)
async function ProductPage({ id }) {
  const product = await getProduct(id);

  return (
    <div>
      {/* Server-rendered content */}
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>

      {/* Client component for interactivity */}
      <AddToCartButton productId={id} />
      
      {/* Pass server data to client */}
      <ProductReviews initialReviews={product.reviews} />
    </div>
  );
}

// Client Component
'use client';

function AddToCartButton({ productId }) {
  const [adding, setAdding] = useState(false);

  const handleClick = async () => {
    setAdding(true);
    await addToCart(productId);
    setAdding(false);
  };

  return (
    <button onClick={handleClick} disabled={adding}>
      {adding ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}

// -------------------------------------------------------------------------------------------
// 4. PASSING SERVER DATA TO CLIENT
// -------------------------------------------------------------------------------------------

// Server Component fetches data
async function Dashboard() {
  const data = await fetchDashboardData();

  return (
    <div>
      {/* Pass serializable data to client component */}
      <InteractiveChart data={data.chartData} />
      <FilterableTable initialData={data.tableData} />
    </div>
  );
}

// Client Component receives serialized data
'use client';

function InteractiveChart({ data }) {
  const [filter, setFilter] = useState('all');
  // Use data for interactive chart
  return <Chart data={data} filter={filter} />;
}

// -------------------------------------------------------------------------------------------
// 5. CHILDREN PATTERN
// -------------------------------------------------------------------------------------------

/**
 * Pass Server Components as children to Client Components.
 * The server component is pre-rendered and passed as props.
 */

// Client Component wrapper
'use client';

function Accordion({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>{title}</button>
      {isOpen && <div>{children}</div>}
    </div>
  );
}

// Server Component usage
async function FAQ() {
  const faqs = await getFAQs();

  return (
    <div>
      {faqs.map((faq) => (
        <Accordion key={faq.id} title={faq.question}>
          {/* This content is server-rendered */}
          <p>{faq.answer}</p>
        </Accordion>
      ))}
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 6. DATA FETCHING IN SERVER COMPONENTS
// -------------------------------------------------------------------------------------------

// Direct database access
async function UserProfile({ userId }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return <div>{user.name}</div>;
}

// File system access
import { readFile } from 'fs/promises';

async function MarkdownContent({ filename }) {
  const content = await readFile(`./content/${filename}.md`, 'utf-8');
  return <Markdown>{content}</Markdown>;
}

// Environment variables (secrets)
async function SecureAPI() {
  const response = await fetch('https://api.example.com', {
    headers: { Authorization: `Bearer ${process.env.API_SECRET}` },
  });
  return response.json();
}

// -------------------------------------------------------------------------------------------
// 7. STREAMING AND SUSPENSE
// -------------------------------------------------------------------------------------------

import { Suspense } from 'react';

async function Page() {
  return (
    <div>
      {/* Renders immediately */}
      <Header />

      {/* Streams when ready */}
      <Suspense fallback={<ProductsSkeleton />}>
        <ProductList />
      </Suspense>

      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews />
      </Suspense>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 8. WHAT CAN'T BE DONE IN SERVER COMPONENTS
// -------------------------------------------------------------------------------------------

/**
 * Server Components CANNOT:
 * ❌ useState, useEffect, or other hooks
 * ❌ Browser APIs (window, document)
 * ❌ Event handlers (onClick, onChange)
 * ❌ Context (as consumers)
 * ❌ Custom hooks with state
 *
 * Server Components CAN:
 * ✅ async/await
 * ✅ Direct database queries
 * ✅ File system access
 * ✅ Private API keys
 * ✅ Heavy dependencies (no bundle impact)
 */

// -------------------------------------------------------------------------------------------
// 9. WHEN TO USE EACH
// -------------------------------------------------------------------------------------------

/**
 * USE SERVER COMPONENTS FOR:
 * - Static content
 * - Data fetching
 * - Backend-only logic
 * - Heavy dependencies
 * - SEO-critical content
 *
 * USE CLIENT COMPONENTS FOR:
 * - User interactions
 * - State management
 * - Browser APIs
 * - Real-time updates
 * - Event handlers
 */

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Server Components reduce JavaScript bundle
 * 2. Direct backend access (no API layer needed)
 * 3. Use 'use client' for interactive components
 * 4. Compose server and client components
 *
 * BEST PRACTICES:
 * - Keep client components small and focused
 * - Fetch data at the server component level
 * - Pass data down, not fetch in clients
 * - Use Suspense for streaming
 * - Move interactivity to leaf components
 *
 * FRAMEWORKS:
 * - Next.js 13+ (App Router)
 * - Hydrogen (Shopify)
 * - Waku
 */
