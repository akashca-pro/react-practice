/**
 * TOPIC: TYPESCRIPT WITH REACT COMPONENTS
 * DESCRIPTION:
 * TypeScript adds static typing to React, catching errors at compile time.
 * This covers typing components, props, state, and common patterns.
 */

import { useState, useEffect, useRef, FC, ReactNode, ComponentProps } from 'react';

// -------------------------------------------------------------------------------------------
// 1. BASIC COMPONENT PROPS
// -------------------------------------------------------------------------------------------

// Props interface
interface GreetingProps {
  name: string;
  age?: number; // Optional prop
}

// Typed functional component
function Greeting({ name, age }: GreetingProps) {
  return (
    <div>
      Hello, {name}! {age && `You are ${age} years old.`}
    </div>
  );
}

// Alternative: Using FC (less recommended now)
const GreetingFC: FC<GreetingProps> = ({ name, age }) => {
  return <div>Hello, {name}!</div>;
};

// -------------------------------------------------------------------------------------------
// 2. CHILDREN PROP
// -------------------------------------------------------------------------------------------

interface CardProps {
  title: string;
  children: ReactNode; // Most flexible
}

function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// PropsWithChildren utility
import { PropsWithChildren } from 'react';

type PanelProps = PropsWithChildren<{
  title: string;
}>;

function Panel({ title, children }: PanelProps) {
  return <div>{children}</div>;
}

// -------------------------------------------------------------------------------------------
// 3. EVENT HANDLERS
// -------------------------------------------------------------------------------------------

function EventExamples() {
  // Typed event handlers
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log(e.currentTarget.name);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Handle enter
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} onKeyDown={handleKeyDown} />
      <button onClick={handleClick} name="submit">Submit</button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 4. STATE TYPING
// -------------------------------------------------------------------------------------------

interface User {
  id: number;
  name: string;
  email: string;
}

function UserProfile() {
  // Simple types are inferred
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  // Complex types need annotation
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  return <div>...</div>;
}

// -------------------------------------------------------------------------------------------
// 5. REF TYPING
// -------------------------------------------------------------------------------------------

function InputForm() {
  // DOM element refs
  const inputRef = useRef<HTMLInputElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

  // Mutable ref (not for DOM)
  const countRef = useRef<number>(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} />;
}

// -------------------------------------------------------------------------------------------
// 6. CALLBACK PROPS
// -------------------------------------------------------------------------------------------

interface ButtonProps {
  onClick: () => void;
  onHover?: (isHovered: boolean) => void;
  onSubmit: (data: { name: string }) => Promise<void>;
}

function ActionButton({ onClick, onHover, onSubmit }: ButtonProps) {
  return <button onClick={onClick}>Click</button>;
}

// With generics
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  onSelect?: (item: T) => void;
}

function List<T>({ items, renderItem, onSelect }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index} onClick={() => onSelect?.(item)}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}

// Usage
<List
  items={[{ id: 1, name: 'Item 1' }]}
  renderItem={(item) => <span>{item.name}</span>}
  onSelect={(item) => console.log(item.id)}
/>;

// -------------------------------------------------------------------------------------------
// 7. EXTENDING HTML ELEMENT PROPS
// -------------------------------------------------------------------------------------------

// Extend native button props
interface CustomButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

function CustomButton({ variant = 'primary', isLoading, children, ...props }: CustomButtonProps) {
  return (
    <button className={`btn-${variant}`} disabled={isLoading} {...props}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
}

// Omit specific props
type InputProps = Omit<ComponentProps<'input'>, 'onChange'> & {
  onChange: (value: string) => void;
};

// -------------------------------------------------------------------------------------------
// 8. DISCRIMINATED UNIONS
// -------------------------------------------------------------------------------------------

type AlertProps =
  | { type: 'success'; message: string }
  | { type: 'error'; message: string; retry: () => void }
  | { type: 'loading' };

function Alert(props: AlertProps) {
  switch (props.type) {
    case 'success':
      return <div className="success">{props.message}</div>;
    case 'error':
      return (
        <div className="error">
          {props.message}
          <button onClick={props.retry}>Retry</button>
        </div>
      );
    case 'loading':
      return <div className="loading">Loading...</div>;
  }
}

// -------------------------------------------------------------------------------------------
// 9. COMPONENT PROP TYPES
// -------------------------------------------------------------------------------------------

// Extract props from component
type MyComponentProps = ComponentProps<typeof MyComponent>;

// HTMLElement types
type DivProps = ComponentProps<'div'>;
type ButtonProps = ComponentProps<'button'>;

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY TYPES:
 * - ReactNode: Any renderable content
 * - ComponentProps<T>: Props of a component/element
 * - PropsWithChildren<P>: Props with children
 * - MouseEvent, ChangeEvent, etc.
 *
 * BEST PRACTICES:
 * - Use interface for props
 * - Let TypeScript infer when possible
 * - Use discriminated unions for variants
 * - Extend HTML props for custom elements
 * - Avoid FC, use regular functions
 */
