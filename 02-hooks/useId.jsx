/**
 * TOPIC: useId HOOK
 * DESCRIPTION:
 * useId generates unique IDs that are stable across server and client
 * renders. It's primarily used for accessibility attributes like
 * aria-labelledby and htmlFor.
 */

import { useId } from 'react';

// -------------------------------------------------------------------------------------------
// 1. BASIC USAGE
// -------------------------------------------------------------------------------------------

function InputField({ label }) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" />
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 2. MULTIPLE IDS
// -------------------------------------------------------------------------------------------

function Form() {
  const id = useId();

  return (
    <form>
      <div>
        <label htmlFor={`${id}-name`}>Name</label>
        <input id={`${id}-name`} />
      </div>
      <div>
        <label htmlFor={`${id}-email`}>Email</label>
        <input id={`${id}-email`} type="email" />
      </div>
      <div>
        <label htmlFor={`${id}-password`}>Password</label>
        <input id={`${id}-password`} type="password" />
        <p id={`${id}-password-hint`}>Must be 8+ characters</p>
        <input aria-describedby={`${id}-password-hint`} />
      </div>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 3. ACCESSIBILITY PATTERNS
// -------------------------------------------------------------------------------------------

// Form with proper labeling
function AccessibleForm() {
  const id = useId();

  return (
    <div>
      <h2 id={`${id}-title`}>Contact Form</h2>
      <form aria-labelledby={`${id}-title`}>
        <label htmlFor={`${id}-message`}>Message</label>
        <textarea
          id={`${id}-message`}
          aria-describedby={`${id}-message-help`}
        />
        <p id={`${id}-message-help`}>Maximum 500 characters</p>
      </form>
    </div>
  );
}

// Modal with aria-labelledby
function Modal({ title, children, onClose }) {
  const id = useId();

  return (
    <div role="dialog" aria-labelledby={`${id}-title`} aria-modal="true">
      <h2 id={`${id}-title`}>{title}</h2>
      <div>{children}</div>
      <button onClick={onClose}>Close</button>
    </div>
  );
}

// Accordion
function Accordion({ items }) {
  const id = useId();

  return (
    <div>
      {items.map((item, index) => (
        <div key={index}>
          <button
            id={`${id}-header-${index}`}
            aria-controls={`${id}-panel-${index}`}
            aria-expanded="false"
          >
            {item.title}
          </button>
          <div
            id={`${id}-panel-${index}`}
            aria-labelledby={`${id}-header-${index}`}
            role="region"
          >
            {item.content}
          </div>
        </div>
      ))}
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 4. WHY NOT USE OTHER ID METHODS
// -------------------------------------------------------------------------------------------

/**
 * DON'T USE:
 * - Math.random() - different on client/server (hydration mismatch)
 * - Incrementing counter - different order on server
 * - UUID libraries - same issues
 *
 * USE useId because:
 * - Same ID on server and client
 * - Unique per component instance
 * - Works with React's concurrent features
 */

// BAD: Global counter (SSR issues)
let globalCounter = 0;
function BadInput() {
  const id = `input-${globalCounter++}`; // Server: 0, Client: 0... mismatch!
  return <input id={id} />;
}

// BAD: Random ID
function BadRandomInput() {
  const id = `input-${Math.random()}`; // Different on server and client!
  return <input id={id} />;
}

// GOOD: useId
function GoodInput() {
  const id = useId(); // Same on server and client
  return <input id={id} />;
}

// -------------------------------------------------------------------------------------------
// 5. REUSABLE COMPONENTS
// -------------------------------------------------------------------------------------------

function TextField({ label, type = 'text', helpText, ...props }) {
  const id = useId();
  const helpId = helpText ? `${id}-help` : undefined;

  return (
    <div className="text-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        aria-describedby={helpId}
        {...props}
      />
      {helpText && <p id={helpId}>{helpText}</p>}
    </div>
  );
}

function Select({ label, options, ...props }) {
  const id = useId();

  return (
    <div className="select-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 6. IMPORTANT NOTES
// -------------------------------------------------------------------------------------------

/**
 * NOTES:
 * 1. Don't use for list keys (use data IDs)
 * 2. IDs start with : (colon) - valid HTML but looks unusual
 * 3. Call at top level of component
 * 4. Each call generates a new unique ID
 */

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Generates unique, stable IDs
 * 2. Same ID on server and client
 * 3. Primarily for accessibility attributes
 * 4. Call once, derive multiple IDs with suffixes
 *
 * BEST PRACTICES:
 * - Use for label/input associations
 * - Use for aria-labelledby, aria-describedby
 * - Generate one ID, add suffixes for related elements
 * - Don't use for list keys
 *
 * USE CASES:
 * - htmlFor + id associations
 * - aria-* accessibility attributes
 * - Component libraries with unique IDs
 */
