/**
 * TOPIC: COMPONENTS AND PROPS
 * DESCRIPTION:
 * Components are the building blocks of React applications. They let you
 * split the UI into independent, reusable pieces. Props (short for properties)
 * are how components communicate - they pass data from parent to child.
 * Understanding components and props is essential for building scalable React apps.
 */

// -------------------------------------------------------------------------------------------
// 1. FUNCTIONAL COMPONENTS
// -------------------------------------------------------------------------------------------

/**
 * Functional components are JavaScript functions that return JSX.
 * They are the modern, preferred way to write React components.
 */

// Basic functional component
function Welcome() {
  return <h1>Hello, World!</h1>;
}

// Arrow function component
const Greeting = () => {
  return <h1>Welcome to React!</h1>;
};

// Arrow function with implicit return
const SimpleGreeting = () => <h1>Simple Hello!</h1>;

/**
 * COMPONENT NAMING RULES:
 * - Must start with uppercase letter (PascalCase)
 * - Lowercase names are treated as HTML elements
 * - Choose descriptive, meaningful names
 */

// Good component names
function UserProfile() { /* ... */ }
function NavigationMenu() { /* ... */ }
function ProductCard() { /* ... */ }

// Bad: lowercase (React treats as HTML element)
// function userProfile() { /* Doesn't work as expected */ }

// -------------------------------------------------------------------------------------------
// 2. PROPS BASICS
// -------------------------------------------------------------------------------------------

/**
 * Props are read-only inputs passed to components.
 * They flow down from parent to child (unidirectional data flow).
 */

// Receiving props as an object
function WelcomeUser(props) {
  return <h1>Hello, {props.name}!</h1>;
}

// Destructuring props (preferred)
function WelcomeUserDestructured({ name }) {
  return <h1>Hello, {name}!</h1>;
}

// Using the component
function App() {
  return (
    <div>
      <WelcomeUser name="Akash" />
      <WelcomeUserDestructured name="John" />
    </div>
  );
}

// Multiple props
function UserCard({ name, age, email, isActive }) {
  return (
    <div className="user-card">
      <h2>{name}</h2>
      <p>Age: {age}</p>
      <p>Email: {email}</p>
      <p>Status: {isActive ? 'Active' : 'Inactive'}</p>
    </div>
  );
}

// Usage
<UserCard name="Alice" age={28} email="alice@example.com" isActive={true} />;

// -------------------------------------------------------------------------------------------
// 3. DEFAULT PROPS
// -------------------------------------------------------------------------------------------

/**
 * Default props provide fallback values when a prop is not passed.
 * Use JavaScript default parameters or defaultProps property.
 */

// Method 1: Default parameters (recommended for functional components)
function Button({ text = 'Click me', type = 'button', disabled = false }) {
  return (
    <button type={type} disabled={disabled}>
      {text}
    </button>
  );
}

// Method 2: Fallback with OR operator
function Avatar({ src, alt }) {
  return <img src={src || '/default-avatar.png'} alt={alt || 'User avatar'} />;
}

// Method 3: Nullish coalescing (handles null/undefined only)
function Counter({ initialCount }) {
  const count = initialCount ?? 0; // 0 is a valid value, only null/undefined triggers default
  return <span>{count}</span>;
}

// Using the components
<Button /> // Uses all defaults: "Click me", "button", false
<Button text="Submit" type="submit" /> // Override some props
<Avatar /> // Uses default avatar

// -------------------------------------------------------------------------------------------
// 4. PROPS SPREADING
// -------------------------------------------------------------------------------------------

/**
 * Spread operator allows passing all properties of an object as props.
 * Useful for forwarding props or working with configuration objects.
 */

// Spreading all props
function Input(props) {
  return <input {...props} />;
}

const inputConfig = {
  type: 'email',
  placeholder: 'Enter email',
  required: true,
  className: 'form-input',
};

<Input {...inputConfig} />;

// Spreading with overrides
function CustomButton({ variant, ...restProps }) {
  const className = `btn btn-${variant}`;
  return <button className={className} {...restProps} />;
}

<CustomButton variant="primary" onClick={handleClick} disabled={false}>
  Submit
</CustomButton>;

// Careful: Order matters with spreads
function Example({ className, ...props }) {
  // props.className would override "base-class"
  return <div className="base-class" {...props} />;
  
  // To combine: className={`base-class ${className}`}
}

// -------------------------------------------------------------------------------------------
// 5. CHILDREN PROP
// -------------------------------------------------------------------------------------------

/**
 * The children prop contains whatever you include between the opening
 * and closing tags of a component. It enables composition.
 */

// Basic children usage
function Card({ children }) {
  return <div className="card">{children}</div>;
}

function App() {
  return (
    <Card>
      <h2>Title</h2>
      <p>This is the card content</p>
    </Card>
  );
}

// Children with other props
function Modal({ title, children, onClose }) {
  return (
    <div className="modal">
      <div className="modal-header">
        <h2>{title}</h2>
        <button onClick={onClose}>×</button>
      </div>
      <div className="modal-body">{children}</div>
    </div>
  );
}

// Multiple children slots using named props
function Layout({ header, sidebar, children, footer }) {
  return (
    <div className="layout">
      <header>{header}</header>
      <aside>{sidebar}</aside>
      <main>{children}</main>
      <footer>{footer}</footer>
    </div>
  );
}

<Layout
  header={<Navigation />}
  sidebar={<Sidebar />}
  footer={<Footer />}
>
  <MainContent />
</Layout>;

// -------------------------------------------------------------------------------------------
// 6. COMPONENT COMPOSITION
// -------------------------------------------------------------------------------------------

/**
 * Composition is the primary pattern for code reuse in React.
 * Build complex UIs by combining simple components.
 */

// Small, focused components
function Avatar({ src, alt, size = 'medium' }) {
  return <img className={`avatar avatar-${size}`} src={src} alt={alt} />;
}

function UserName({ name, isVerified }) {
  return (
    <span className="username">
      {name} {isVerified && '✓'}
    </span>
  );
}

function UserBio({ bio }) {
  return <p className="bio">{bio}</p>;
}

// Composed into a larger component
function UserProfile({ user }) {
  return (
    <div className="user-profile">
      <Avatar src={user.avatarUrl} alt={user.name} size="large" />
      <UserName name={user.name} isVerified={user.isVerified} />
      <UserBio bio={user.bio} />
    </div>
  );
}

// "Specialization" through composition
function Dialog({ title, message, children }) {
  return (
    <div className="dialog">
      <h2>{title}</h2>
      <p>{message}</p>
      {children}
    </div>
  );
}

// WelcomeDialog is a specialized Dialog
function WelcomeDialog() {
  return (
    <Dialog title="Welcome!" message="Thank you for visiting our site!">
      <button>Get Started</button>
    </Dialog>
  );
}

// -------------------------------------------------------------------------------------------
// 7. PROPS ARE READ-ONLY
// -------------------------------------------------------------------------------------------

/**
 * Props should never be modified by the receiving component.
 * React components must act like "pure functions" with respect to their props.
 */

// WRONG: Mutating props
function BadComponent(props) {
  props.name = 'Modified'; // DON'T DO THIS!
  return <h1>{props.name}</h1>;
}

// CORRECT: Treat props as immutable
function GoodComponent({ name }) {
  // If you need to modify, use local state
  const [localName, setLocalName] = useState(name);
  return <h1>{localName}</h1>;
}

// Props represent the "external" configuration
// State represents the "internal" data that can change

// -------------------------------------------------------------------------------------------
// 8. PROP TYPES AND VALIDATION
// -------------------------------------------------------------------------------------------

/**
 * PropTypes provide runtime type checking for props.
 * TypeScript is preferred for compile-time type checking.
 */

import PropTypes from 'prop-types';

function User({ name, age, email, friends, onSelect }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>Age: {age}</p>
    </div>
  );
}

User.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number,
  email: PropTypes.string,
  friends: PropTypes.arrayOf(PropTypes.string),
  onSelect: PropTypes.func,
  role: PropTypes.oneOf(['admin', 'user', 'guest']),
  config: PropTypes.shape({
    theme: PropTypes.string,
    language: PropTypes.string,
  }),
};

User.defaultProps = {
  age: 0,
  friends: [],
};

/**
 * COMMON PROP TYPES:
 * PropTypes.string, .number, .bool, .func, .object, .array
 * PropTypes.node (anything renderable)
 * PropTypes.element (React element)
 * PropTypes.instanceOf(Class)
 * PropTypes.oneOf(['value1', 'value2'])
 * PropTypes.oneOfType([PropTypes.string, PropTypes.number])
 * PropTypes.arrayOf(PropTypes.number)
 * PropTypes.objectOf(PropTypes.number)
 * PropTypes.shape({ key: PropTypes.string })
 * PropTypes.exact({ key: PropTypes.string }) // No extra props allowed
 * .isRequired // Chain to make required
 */

// -------------------------------------------------------------------------------------------
// 9. PASSING FUNCTIONS AS PROPS
// -------------------------------------------------------------------------------------------

/**
 * Functions can be passed as props for child-to-parent communication.
 * This is how children notify parents about events.
 */

function Button({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
}

function ParentComponent() {
  const handleClick = () => {
    console.log('Button was clicked!');
  };

  return <Button onClick={handleClick}>Click Me</Button>;
}

// Passing data back to parent
function ChildForm({ onSubmit }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(value); // Send data to parent
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  );
}

function Parent() {
  const handleFormSubmit = (data) => {
    console.log('Received from child:', data);
  };

  return <ChildForm onSubmit={handleFormSubmit} />;
}

// Common naming convention: prefix with "on" for event handlers
// onClick, onSubmit, onChange, onSelect, onDelete

// -------------------------------------------------------------------------------------------
// 10. CONDITIONAL PROPS
// -------------------------------------------------------------------------------------------

/**
 * Props can be conditionally passed to components.
 */

function ConditionalButton({ isDisabled, isPrimary, isLoading }) {
  return (
    <button
      disabled={isDisabled}
      className={isPrimary ? 'btn-primary' : 'btn-secondary'}
      aria-busy={isLoading || undefined} // Don't include attribute if false
    >
      {isLoading ? 'Loading...' : 'Click Me'}
    </button>
  );
}

// Conditional prop passing
function Form({ isEditing }) {
  const commonProps = {
    className: 'input',
    required: true,
  };

  return (
    <input
      {...commonProps}
      {...(isEditing && { readOnly: true })}
      {...(isEditing ? { value: 'Fixed value' } : { placeholder: 'Enter text' })}
    />
  );
}

// -------------------------------------------------------------------------------------------
// 11. COMPONENT ORGANIZATION
// -------------------------------------------------------------------------------------------

/**
 * Best practices for organizing components in a React project.
 */

/**
 * FILE STRUCTURE OPTIONS:
 *
 * 1. Feature-based (recommended for large apps):
 *    src/
 *    ├── features/
 *    │   ├── auth/
 *    │   │   ├── LoginForm.js
 *    │   │   ├── RegisterForm.js
 *    │   │   └── hooks/useAuth.js
 *    │   └── products/
 *    │       ├── ProductList.js
 *    │       └── ProductCard.js
 *    └── shared/
 *        ├── Button.js
 *        └── Modal.js
 *
 * 2. Type-based (simpler projects):
 *    src/
 *    ├── components/
 *    │   ├── Button.js
 *    │   └── Card.js
 *    ├── pages/
 *    │   ├── Home.js
 *    │   └── About.js
 *    └── hooks/
 *        └── useLocalStorage.js
 */

// One component per file
// Export component as default or named export

// Default export (one main component per file)
export default function MainComponent() {
  return <div>Main</div>;
}

// Named exports (for multiple related components)
export function PrimaryButton() { /* ... */ }
export function SecondaryButton() { /* ... */ }

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * COMPONENTS AND PROPS KEY POINTS:
 *
 * 1. Components are functions that return JSX
 * 2. Props flow down from parent to child (unidirectional)
 * 3. Props are read-only - never mutate them
 * 4. Use destructuring for cleaner prop access
 * 5. children prop enables composition
 * 6. Composition over inheritance for code reuse
 *
 * BEST PRACTICES:
 * - Keep components small and focused (Single Responsibility)
 * - Use PascalCase for component names
 * - Destructure props at the function parameter level
 * - Provide default values for optional props
 * - Use TypeScript or PropTypes for type safety
 * - Name callback props with "on" prefix (onClick, onSubmit)
 * - Extract reusable components early
 * - One component per file for larger projects
 *
 * COMPOSITION PATTERNS:
 * - Container/Presentational components
 * - Specialized components (wrapping generic ones)
 * - children for flexible content injection
 * - Named slot props for complex layouts
 *
 * COMMON MISTAKES TO AVOID:
 * - Mutating props directly
 * - Deeply nested prop drilling (use Context instead)
 * - Creating new functions/objects in props (wrap in useCallback/useMemo)
 * - Using index as key for dynamic lists
 */
