/**
 * TOPIC: COMPOUND COMPONENTS
 * DESCRIPTION:
 * Compound components work together to form a complete UI component.
 * They share implicit state and provide a flexible, declarative API.
 * Think of <select> and <option> as native compound components.
 */

import { createContext, useContext, useState, Children, cloneElement } from 'react';

// -------------------------------------------------------------------------------------------
// 1. BASIC COMPOUND COMPONENT
// -------------------------------------------------------------------------------------------

const ToggleContext = createContext(null);

function Toggle({ children, defaultOn = false }) {
  const [on, setOn] = useState(defaultOn);
  const toggle = () => setOn((o) => !o);

  return (
    <ToggleContext.Provider value={{ on, toggle }}>
      {children}
    </ToggleContext.Provider>
  );
}

Toggle.On = function On({ children }) {
  const { on } = useContext(ToggleContext);
  return on ? children : null;
};

Toggle.Off = function Off({ children }) {
  const { on } = useContext(ToggleContext);
  return on ? null : children;
};

Toggle.Button = function Button(props) {
  const { on, toggle } = useContext(ToggleContext);
  return <button onClick={toggle} {...props}>{on ? 'ON' : 'OFF'}</button>;
};

// Usage
function App() {
  return (
    <Toggle>
      <Toggle.On>Content is visible!</Toggle.On>
      <Toggle.Off>Content is hidden</Toggle.Off>
      <Toggle.Button />
    </Toggle>
  );
}

// -------------------------------------------------------------------------------------------
// 2. TABS COMPOUND COMPONENT
// -------------------------------------------------------------------------------------------

const TabsContext = createContext(null);

function Tabs({ children, defaultIndex = 0 }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.List = function TabList({ children }) {
  return <div className="tabs-list" role="tablist">{children}</div>;
};

Tabs.Tab = function Tab({ children, index }) {
  const { activeIndex, setActiveIndex } = useContext(TabsContext);
  const isActive = activeIndex === index;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={`tab ${isActive ? 'active' : ''}`}
      onClick={() => setActiveIndex(index)}
    >
      {children}
    </button>
  );
};

Tabs.Panels = function TabPanels({ children }) {
  const { activeIndex } = useContext(TabsContext);
  return <div className="tab-panels">{Children.toArray(children)[activeIndex]}</div>;
};

Tabs.Panel = function TabPanel({ children }) {
  return <div className="tab-panel" role="tabpanel">{children}</div>;
};

// Usage
function TabsExample() {
  return (
    <Tabs defaultIndex={0}>
      <Tabs.List>
        <Tabs.Tab index={0}>Tab 1</Tabs.Tab>
        <Tabs.Tab index={1}>Tab 2</Tabs.Tab>
        <Tabs.Tab index={2}>Tab 3</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panels>
        <Tabs.Panel>Content for Tab 1</Tabs.Panel>
        <Tabs.Panel>Content for Tab 2</Tabs.Panel>
        <Tabs.Panel>Content for Tab 3</Tabs.Panel>
      </Tabs.Panels>
    </Tabs>
  );
}

// -------------------------------------------------------------------------------------------
// 3. ACCORDION COMPOUND COMPONENT
// -------------------------------------------------------------------------------------------

const AccordionContext = createContext(null);
const AccordionItemContext = createContext(null);

function Accordion({ children, allowMultiple = false }) {
  const [openItems, setOpenItems] = useState(new Set());

  const toggle = (id) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  const isOpen = (id) => openItems.has(id);

  return (
    <AccordionContext.Provider value={{ toggle, isOpen }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
}

Accordion.Item = function Item({ children, id }) {
  return (
    <AccordionItemContext.Provider value={{ id }}>
      <div className="accordion-item">{children}</div>
    </AccordionItemContext.Provider>
  );
};

Accordion.Header = function Header({ children }) {
  const { toggle, isOpen } = useContext(AccordionContext);
  const { id } = useContext(AccordionItemContext);

  return (
    <button
      className="accordion-header"
      onClick={() => toggle(id)}
      aria-expanded={isOpen(id)}
    >
      {children}
      <span>{isOpen(id) ? '▲' : '▼'}</span>
    </button>
  );
};

Accordion.Panel = function Panel({ children }) {
  const { isOpen } = useContext(AccordionContext);
  const { id } = useContext(AccordionItemContext);

  if (!isOpen(id)) return null;
  return <div className="accordion-panel">{children}</div>;
};

// Usage
function AccordionExample() {
  return (
    <Accordion>
      <Accordion.Item id="1">
        <Accordion.Header>Section 1</Accordion.Header>
        <Accordion.Panel>Content for section 1</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item id="2">
        <Accordion.Header>Section 2</Accordion.Header>
        <Accordion.Panel>Content for section 2</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

// -------------------------------------------------------------------------------------------
// 4. SELECT/DROPDOWN COMPOUND COMPONENT
// -------------------------------------------------------------------------------------------

const SelectContext = createContext(null);

function Select({ children, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const select = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <SelectContext.Provider value={{ value, select, isOpen, setIsOpen }}>
      <div className="select">{children}</div>
    </SelectContext.Provider>
  );
}

Select.Trigger = function Trigger({ children }) {
  const { isOpen, setIsOpen, value } = useContext(SelectContext);
  return (
    <button onClick={() => setIsOpen((o) => !o)} className="select-trigger">
      {children || value || 'Select...'}
    </button>
  );
};

Select.Options = function Options({ children }) {
  const { isOpen } = useContext(SelectContext);
  if (!isOpen) return null;
  return <ul className="select-options">{children}</ul>;
};

Select.Option = function Option({ children, value }) {
  const { select, value: selectedValue } = useContext(SelectContext);
  const isSelected = value === selectedValue;

  return (
    <li
      className={`select-option ${isSelected ? 'selected' : ''}`}
      onClick={() => select(value)}
    >
      {children}
    </li>
  );
};

// -------------------------------------------------------------------------------------------
// 5. BENEFITS OF COMPOUND COMPONENTS
// -------------------------------------------------------------------------------------------

/**
 * BENEFITS:
 * 1. Flexible composition - users control structure
 * 2. Reduced prop drilling - context handles state
 * 3. Expressive API - reads like HTML
 * 4. Encapsulation - internal state is hidden
 * 5. Easy customization - add/remove/reorder children
 */

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Parent provides context with shared state
 * 2. Child components consume context
 * 3. Attach children as static properties
 * 4. Provides flexible, declarative API
 *
 * BEST PRACTICES:
 * - Use context for implicit state sharing
 * - Provide sensible defaults
 * - Add proper accessibility attributes
 * - Document expected child components
 *
 * EXAMPLES IN LIBRARIES:
 * - Radix UI
 * - Headless UI
 * - Reach UI
 */
