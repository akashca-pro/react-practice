/**
 * TOPIC: PROPS CHILDREN
 * DESCRIPTION:
 * The children prop allows components to accept arbitrary JSX.
 * It enables powerful composition patterns and flexible APIs.
 */

import { Children, cloneElement, isValidElement } from 'react';

// -------------------------------------------------------------------------------------------
// 1. BASIC CHILDREN USAGE
// -------------------------------------------------------------------------------------------

function Card({ children }) {
  return <div className="card">{children}</div>;
}

// Usage
<Card>
  <h2>Title</h2>
  <p>Content goes here</p>
</Card>

// -------------------------------------------------------------------------------------------
// 2. CHILDREN WITH OTHER PROPS
// -------------------------------------------------------------------------------------------

function Panel({ title, children, footer }) {
  return (
    <div className="panel">
      <header className="panel-header">{title}</header>
      <main className="panel-body">{children}</main>
      {footer && <footer className="panel-footer">{footer}</footer>}
    </div>
  );
}

// Usage
<Panel title="Settings" footer={<button>Save</button>}>
  <p>Configure your preferences</p>
</Panel>

// -------------------------------------------------------------------------------------------
// 3. React.Children API
// -------------------------------------------------------------------------------------------

/**
 * React.Children provides utilities for working with children.
 */

function List({ children }) {
  // Count children
  const count = Children.count(children);

  // Convert to array
  const childArray = Children.toArray(children);

  // Map over children
  const mapped = Children.map(children, (child, index) => (
    <li key={index}>{child}</li>
  ));

  // forEach (no return value)
  Children.forEach(children, (child) => {
    console.log(child);
  });

  // Get only child (throws if not exactly one)
  // const only = Children.only(children);

  return <ul>{mapped}</ul>;
}

// -------------------------------------------------------------------------------------------
// 4. CLONING CHILDREN
// -------------------------------------------------------------------------------------------

/**
 * cloneElement allows adding props to children.
 */

function RadioGroup({ name, children }) {
  return (
    <div role="radiogroup">
      {Children.map(children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(child, { name }); // Add name prop
        }
        return child;
      })}
    </div>
  );
}

function Radio({ name, value, children }) {
  return (
    <label>
      <input type="radio" name={name} value={value} />
      {children}
    </label>
  );
}

// Usage - name is automatically passed to all Radio children
<RadioGroup name="color">
  <Radio value="red">Red</Radio>
  <Radio value="blue">Blue</Radio>
  <Radio value="green">Green</Radio>
</RadioGroup>

// -------------------------------------------------------------------------------------------
// 5. RENDER PROP VIA CHILDREN
// -------------------------------------------------------------------------------------------

function MousePosition({ children }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handle = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, []);

  // Children as a function
  return children(position);
}

// Usage
<MousePosition>
  {({ x, y }) => <p>Mouse: {x}, {y}</p>}
</MousePosition>

// -------------------------------------------------------------------------------------------
// 6. CONDITIONAL CHILDREN
// -------------------------------------------------------------------------------------------

function ConditionalWrapper({ condition, wrapper, children }) {
  return condition ? wrapper(children) : children;
}

// Usage
<ConditionalWrapper
  condition={isLinked}
  wrapper={(children) => <a href={url}>{children}</a>}
>
  <span>Click me</span>
</ConditionalWrapper>

// -------------------------------------------------------------------------------------------
// 7. CHILDREN TYPE CHECKING
// -------------------------------------------------------------------------------------------

function Tabs({ children }) {
  const tabs = Children.toArray(children).filter(
    (child) => isValidElement(child) && child.type === Tab
  );

  if (tabs.length === 0) {
    console.warn('Tabs requires Tab children');
  }

  return <div className="tabs">{tabs}</div>;
}

function Tab({ label, children }) {
  return <div className="tab">{children}</div>;
}

// -------------------------------------------------------------------------------------------
// 8. SLOTS PATTERN
// -------------------------------------------------------------------------------------------

function Modal({ children }) {
  let header, body, footer;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    
    switch (child.type) {
      case Modal.Header: header = child; break;
      case Modal.Body: body = child; break;  
      case Modal.Footer: footer = child; break;
    }
  });

  return (
    <div className="modal">
      <div className="modal-header">{header}</div>
      <div className="modal-body">{body}</div>
      <div className="modal-footer">{footer}</div>
    </div>
  );
}

Modal.Header = ({ children }) => <>{children}</>;
Modal.Body = ({ children }) => <>{children}</>;
Modal.Footer = ({ children }) => <>{children}</>;

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. children is a special prop for nested content
 * 2. React.Children API for safe iteration
 * 3. cloneElement to inject props into children
 * 4. Children can be functions (render props)
 *
 * BEST PRACTICES:
 * - Use Children.map instead of children.map
 * - Check isValidElement before cloning
 * - Document expected children types
 * - Consider render props for complex cases
 *
 * COMMON PATTERNS:
 * - Containment (Card, Panel, Modal)
 * - Slot patterns (Header, Body, Footer)
 * - Render props via children
 * - Injecting props via cloneElement
 */
