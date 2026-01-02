/**
 * TOPIC: COMPOSITION VS INHERITANCE
 * DESCRIPTION:
 * React recommends composition over inheritance for code reuse.
 * Composition is more flexible, explicit, and fits React's component model.
 */

// -------------------------------------------------------------------------------------------
// 1. CONTAINMENT PATTERN
// -------------------------------------------------------------------------------------------

/**
 * Use children prop to pass arbitrary elements.
 */

function Card({ children }) {
  return <div className="card">{children}</div>;
}

function Modal({ children, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <button onClick={onClose} className="close-btn">×</button>
        {children}
      </div>
    </div>
  );
}

// Usage
function App() {
  return (
    <Card>
      <h2>Title</h2>
      <p>Any content can go here</p>
    </Card>
  );
}

// -------------------------------------------------------------------------------------------
// 2. MULTIPLE SLOTS
// -------------------------------------------------------------------------------------------

/**
 * Use named props for multiple content slots.
 */

function Layout({ header, sidebar, footer, children }) {
  return (
    <div className="layout">
      <header className="header">{header}</header>
      <aside className="sidebar">{sidebar}</aside>
      <main className="content">{children}</main>
      <footer className="footer">{footer}</footer>
    </div>
  );
}

// Usage
function Page() {
  return (
    <Layout
      header={<Navigation />}
      sidebar={<Sidebar />}
      footer={<Footer />}
    >
      <MainContent />
    </Layout>
  );
}

// -------------------------------------------------------------------------------------------
// 3. SPECIALIZATION
// -------------------------------------------------------------------------------------------

/**
 * Create specialized versions of generic components.
 */

// Generic component
function Dialog({ title, message, children, type = 'default' }) {
  return (
    <div className={`dialog dialog-${type}`}>
      <h2>{title}</h2>
      <p>{message}</p>
      <div className="dialog-actions">{children}</div>
    </div>
  );
}

// Specialized: Confirmation dialog
function ConfirmationDialog({ title, message, onConfirm, onCancel }) {
  return (
    <Dialog title={title} message={message} type="warning">
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </Dialog>
  );
}

// Specialized: Error dialog
function ErrorDialog({ error, onDismiss }) {
  return (
    <Dialog title="Error" message={error.message} type="error">
      <button onClick={onDismiss}>Dismiss</button>
    </Dialog>
  );
}

// -------------------------------------------------------------------------------------------
// 4. COMPOSITION FOR REUSE
// -------------------------------------------------------------------------------------------

// Base button
function Button({ variant = 'default', size = 'medium', children, ...props }) {
  return (
    <button className={`btn btn-${variant} btn-${size}`} {...props}>
      {children}
    </button>
  );
}

// Composed variants
function PrimaryButton(props) {
  return <Button variant="primary" {...props} />;
}

function DangerButton(props) {
  return <Button variant="danger" {...props} />;
}

function IconButton({ icon, children, ...props }) {
  return (
    <Button {...props}>
      <span className="icon">{icon}</span>
      {children}
    </Button>
  );
}

// -------------------------------------------------------------------------------------------
// 5. WHY NOT INHERITANCE
// -------------------------------------------------------------------------------------------

/**
 * PROBLEMS WITH INHERITANCE IN REACT:
 *
 * 1. Tight Coupling: Child tied to parent implementation
 * 2. Fragile Base Class: Parent changes break children
 * 3. Inflexible: Can't easily mix behaviors
 * 4. React doesn't support class inheritance well
 *
 * COMPOSITION BENEFITS:
 * 1. Explicit dependencies (props)
 * 2. Easy to test in isolation
 * 3. Mix and match behaviors freely
 * 4. Follows React's declarative model
 */

// BAD: Inheritance approach (don't do this)
class BadBaseComponent extends React.Component {
  render() {
    return <div>{this.renderContent()}</div>;
  }
  renderContent() { return null; }
}

class BadChildComponent extends BadBaseComponent {
  renderContent() {
    return <p>Content</p>;
  }
}

// GOOD: Composition approach
function GoodWrapper({ children }) {
  return <div>{children}</div>;
}

function GoodComponent() {
  return (
    <GoodWrapper>
      <p>Content</p>
    </GoodWrapper>
  );
}

// -------------------------------------------------------------------------------------------
// 6. COMPOSITION PATTERNS COMPARISON
// -------------------------------------------------------------------------------------------

/**
 * Children prop: Generic containment
 * Named slots: Multiple content areas
 * Specialization: Pre-configured variants
 * Render props: Dynamic rendering logic
 * HOCs: Cross-cutting concerns
 * Hooks: Shared stateful logic
 */

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Composition over inheritance
 * 2. Use children for containment
 * 3. Use named props for multiple slots
 * 4. Create specialized versions via composition
 *
 * BEST PRACTICES:
 * - Keep components small and focused
 * - Pass elements via props for flexibility
 * - Create specialized components by wrapping generic ones
 * - Use hooks for shared stateful logic
 * - Avoid class inheritance in React
 */
