/**
 * TOPIC: EVENT HANDLING
 * DESCRIPTION:
 * React events work similarly to DOM events but with some differences.
 * Understanding React's event system is crucial for building interactive UIs.
 */

// -------------------------------------------------------------------------------------------
// 1. EVENT HANDLER BASICS
// -------------------------------------------------------------------------------------------

/**
 * React events use camelCase naming: onClick, onChange, onSubmit, etc.
 * Pass functions, not function calls: onClick={handleClick} not onClick={handleClick()}
 */

function Button() {
  const handleClick = () => {
    console.log('Button clicked!');
  };

  return <button onClick={handleClick}>Click me</button>;
}

// Inline handlers (ok for simple cases)
function InlineButton() {
  return <button onClick={() => console.log('Clicked!')}>Click</button>;
}

// -------------------------------------------------------------------------------------------
// 2. EVENT OBJECT (SyntheticEvent)
// -------------------------------------------------------------------------------------------

/**
 * React wraps native events in SyntheticEvent for cross-browser compatibility.
 */

function Form() {
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent form submission
    console.log('Form submitted');
  };

  const handleChange = (event) => {
    console.log('Name:', event.target.name);
    console.log('Value:', event.target.value);
    console.log('Type:', event.type);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" onChange={handleChange} />
      <button type="submit">Submit</button>
    </form>
  );
}

// Accessing native event
function NativeEvent() {
  const handleClick = (event) => {
    console.log(event.nativeEvent); // Original DOM event
  };

  return <button onClick={handleClick}>Click</button>;
}

// -------------------------------------------------------------------------------------------
// 3. PASSING ARGUMENTS TO HANDLERS
// -------------------------------------------------------------------------------------------

// Using arrow function
function ItemList({ items, onDelete }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          {item.name}
          <button onClick={() => onDelete(item.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

// Using bind (less common)
function ItemListBind({ items, onDelete }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <button onClick={onDelete.bind(null, item.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

// Using data attributes
function ItemListData({ items }) {
  const handleDelete = (event) => {
    const id = event.currentTarget.dataset.id;
    console.log('Delete:', id);
  };

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <button data-id={item.id} onClick={handleDelete}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

// -------------------------------------------------------------------------------------------
// 4. COMMON EVENTS
// -------------------------------------------------------------------------------------------

function CommonEvents() {
  return (
    <div>
      {/* Mouse Events */}
      <button onClick={(e) => console.log('click')}>Click</button>
      <button onDoubleClick={(e) => console.log('double click')}>Double</button>
      <div onMouseEnter={(e) => console.log('enter')}>Hover me</div>
      <div onMouseLeave={(e) => console.log('leave')}>Hover me</div>

      {/* Form Events */}
      <input onChange={(e) => console.log(e.target.value)} />
      <input onFocus={(e) => console.log('focused')} />
      <input onBlur={(e) => console.log('blurred')} />
      <form onSubmit={(e) => e.preventDefault()}>Submit</form>

      {/* Keyboard Events */}
      <input onKeyDown={(e) => console.log(e.key)} />
      <input onKeyUp={(e) => console.log(e.key)} />

      {/* Clipboard Events */}
      <input onCopy={(e) => console.log('copied')} />
      <input onPaste={(e) => console.log(e.clipboardData.getData('text'))} />
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 5. EVENT PROPAGATION
// -------------------------------------------------------------------------------------------

function Propagation() {
  return (
    <div onClick={() => console.log('Parent clicked')}>
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevents bubbling to parent
          console.log('Button clicked');
        }}
      >
        Click me
      </button>
    </div>
  );
}

// Capture phase
function CapturePhase() {
  return (
    <div onClickCapture={() => console.log('Capture: parent')}>
      <button onClick={() => console.log('Bubble: button')}>
        Click
      </button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 6. KEYBOARD EVENTS
// -------------------------------------------------------------------------------------------

function KeyboardHandling() {
  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'Enter': console.log('Submit'); break;
      case 'Escape': console.log('Cancel'); break;
      case 'ArrowUp': console.log('Move up'); break;
    }

    // Modifier keys
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      console.log('Save');
    }
  };

  return <input onKeyDown={handleKeyDown} />;
}

// -------------------------------------------------------------------------------------------
// 7. FORM HANDLING PATTERNS
// -------------------------------------------------------------------------------------------

import { useState } from 'react';

function ControlledForm() {
  const [values, setValues] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submit:', values);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" value={values.email} onChange={handleChange} />
      <input name="password" type="password" value={values.password} onChange={handleChange} />
      <button type="submit">Submit</button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Events use camelCase (onClick, onChange)
 * 2. Pass function references, not calls
 * 3. React uses SyntheticEvents for cross-browser compatibility
 * 4. Use event.preventDefault() and event.stopPropagation() as needed
 *
 * BEST PRACTICES:
 * - Define handlers outside JSX for readability
 * - Use useCallback for handlers passed to child components
 * - Prefer controlled components for forms
 * - Handle keyboard events for accessibility
 * - Use data attributes to avoid creating new functions in maps
 */
