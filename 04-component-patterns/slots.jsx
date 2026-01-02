/**
 * TOPIC: SLOTS PATTERN
 * DESCRIPTION:
 * The slots pattern provides named content areas within a component,
 * similar to Vue's named slots. It enables flexible, declarative layouts.
 */

import { Children, isValidElement } from 'react';

// -------------------------------------------------------------------------------------------
// 1. BASIC SLOTS VIA PROPS
// -------------------------------------------------------------------------------------------

/**
 * Simple slots using named props.
 */

function Card({ header, children, footer }) {
  return (
    <div className="card">
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

// Usage
<Card
  header={<h2>Title</h2>}
  footer={<button>Submit</button>}
>
  <p>Main content here</p>
</Card>

// -------------------------------------------------------------------------------------------
// 2. SLOTS VIA STATIC COMPONENTS
// -------------------------------------------------------------------------------------------

/**
 * More declarative API using compound components for slots.
 */

function Dialog({ children }) {
  let title, content, actions;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    
    if (child.type === Dialog.Title) title = child;
    else if (child.type === Dialog.Content) content = child;
    else if (child.type === Dialog.Actions) actions = child;
  });

  return (
    <div className="dialog" role="dialog">
      {title && <div className="dialog-title">{title}</div>}
      {content && <div className="dialog-content">{content}</div>}
      {actions && <div className="dialog-actions">{actions}</div>}
    </div>
  );
}

Dialog.Title = ({ children }) => <>{children}</>;
Dialog.Content = ({ children }) => <>{children}</>;
Dialog.Actions = ({ children }) => <>{children}</>;

// Usage
<Dialog>
  <Dialog.Title>Confirm Action</Dialog.Title>
  <Dialog.Content>
    <p>Are you sure you want to proceed?</p>
  </Dialog.Content>
  <Dialog.Actions>
    <button onClick={onCancel}>Cancel</button>
    <button onClick={onConfirm}>Confirm</button>
  </Dialog.Actions>
</Dialog>

// -------------------------------------------------------------------------------------------
// 3. FLEXIBLE LAYOUT SLOTS
// -------------------------------------------------------------------------------------------

function PageLayout({ children }) {
  const slots = {
    header: null,
    sidebar: null,
    main: null,
    footer: null,
  };

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const slotName = child.props.slot;
    if (slotName && slots.hasOwnProperty(slotName)) {
      slots[slotName] = child.props.children;
    }
  });

  return (
    <div className="page-layout">
      <header className="layout-header">{slots.header}</header>
      <aside className="layout-sidebar">{slots.sidebar}</aside>
      <main className="layout-main">{slots.main}</main>
      <footer className="layout-footer">{slots.footer}</footer>
    </div>
  );
}

// Slot helper component
function Slot({ slot, children }) {
  return <>{children}</>;
}

// Usage
<PageLayout>
  <Slot slot="header"><Navigation /></Slot>
  <Slot slot="sidebar"><SideMenu /></Slot>
  <Slot slot="main"><Content /></Slot>
  <Slot slot="footer"><FooterContent /></Slot>
</PageLayout>

// -------------------------------------------------------------------------------------------
// 4. DATA TABLE WITH SLOTS
// -------------------------------------------------------------------------------------------

function DataTable({ data, children }) {
  const columns = [];

  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === Column) {
      columns.push(child.props);
    }
  });

  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.field}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((col) => (
              <td key={col.field}>
                {col.render ? col.render(row) : row[col.field]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Column({ field, header, render }) {
  return null; // Just a configuration component
}

// Usage
<DataTable data={users}>
  <Column field="name" header="Name" />
  <Column field="email" header="Email" />
  <Column
    field="actions"
    header="Actions"
    render={(row) => <button onClick={() => edit(row.id)}>Edit</button>}
  />
</DataTable>

// -------------------------------------------------------------------------------------------
// 5. CONDITIONAL SLOTS
// -------------------------------------------------------------------------------------------

function Alert({ type, children }) {
  let icon, title, description, actions;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    
    switch (child.type) {
      case Alert.Icon: icon = child; break;
      case Alert.Title: title = child; break;
      case Alert.Description: description = child; break;
      case Alert.Actions: actions = child; break;
    }
  });

  // Default icon based on type if not provided
  const defaultIcon = { error: '❌', warning: '⚠️', success: '✓', info: 'ℹ️' };

  return (
    <div className={`alert alert-${type}`} role="alert">
      <div className="alert-icon">{icon || defaultIcon[type]}</div>
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        {description && <div className="alert-description">{description}</div>}
      </div>
      {actions && <div className="alert-actions">{actions}</div>}
    </div>
  );
}

Alert.Icon = ({ children }) => <>{children}</>;
Alert.Title = ({ children }) => <>{children}</>;
Alert.Description = ({ children }) => <>{children}</>;
Alert.Actions = ({ children }) => <>{children}</>;

// -------------------------------------------------------------------------------------------
// 6. SLOTS VS RENDER PROPS
// -------------------------------------------------------------------------------------------

/**
 * SLOTS: Static content, declarative
 * RENDER PROPS: Dynamic content, needs data from parent
 */

// Slots: Good for layouting
<Modal>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>Content</Modal.Body>
</Modal>

// Render props: Good when child needs parent data
<DataFetcher url="/api/users">
  {({ data, loading }) => loading ? <Spinner /> : <UserList users={data} />}
</DataFetcher>

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Slots provide named content areas
 * 2. Use props for simple cases
 * 3. Use compound components for complex layouts
 * 4. Slots make APIs more readable and flexible
 *
 * BEST PRACTICES:
 * - Use Children.forEach to extract slots
 * - Provide sensible defaults for optional slots
 * - Document which slots are available
 * - Consider TypeScript for slot type safety
 */
