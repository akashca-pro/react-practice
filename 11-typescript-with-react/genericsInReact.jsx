/**
 * TOPIC: GENERICS IN REACT
 * DESCRIPTION:
 * TypeScript generics enable creating reusable, type-safe components
 * that work with different data types while maintaining full type inference.
 */

import { useState, useCallback, ReactNode } from 'react';

// -------------------------------------------------------------------------------------------
// 1. GENERIC COMPONENTS
// -------------------------------------------------------------------------------------------

/**
 * A generic list component that works with any item type.
 */

interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string | number;
  onSelect?: (item: T) => void;
}

function List<T>({ items, renderItem, keyExtractor, onSelect }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)} onClick={() => onSelect?.(item)}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}

// Usage - TypeScript infers T from items
interface User {
  id: number;
  name: string;
  email: string;
}

function UserList({ users }: { users: User[] }) {
  return (
    <List
      items={users}
      keyExtractor={(user) => user.id}
      renderItem={(user) => <span>{user.name}</span>}
      onSelect={(user) => console.log(user.email)} // user is typed as User
    />
  );
}

// -------------------------------------------------------------------------------------------
// 2. GENERIC SELECT COMPONENT
// -------------------------------------------------------------------------------------------

interface Option {
  label: string;
  value: string | number;
}

interface SelectProps<T extends Option> {
  options: T[];
  value: T | null;
  onChange: (selected: T) => void;
  placeholder?: string;
}

function Select<T extends Option>({
  options,
  value,
  onChange,
  placeholder = 'Select...',
}: SelectProps<T>) {
  return (
    <select
      value={value?.value ?? ''}
      onChange={(e) => {
        const selected = options.find((o) => String(o.value) === e.target.value);
        if (selected) onChange(selected);
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// Usage with extended option type
interface CountryOption extends Option {
  code: string;
  flag: string;
}

const countries: CountryOption[] = [
  { value: 'us', label: 'United States', code: 'US', flag: '🇺🇸' },
  { value: 'uk', label: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
];

function CountrySelector() {
  const [selected, setSelected] = useState<CountryOption | null>(null);

  return (
    <Select
      options={countries}
      value={selected}
      onChange={(country) => console.log(country.flag)} // Has access to .flag
    />
  );
}

// -------------------------------------------------------------------------------------------
// 3. GENERIC TABLE COMPONENT
// -------------------------------------------------------------------------------------------

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], item: T) => ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
}

function Table<T>({ data, columns, keyExtractor }: TableProps<T>) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={String(col.key)}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={keyExtractor(item)}>
            {columns.map((col) => (
              <td key={String(col.key)}>
                {col.render
                  ? col.render(item[col.key], item)
                  : String(item[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Usage
interface Product {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
}

function ProductTable({ products }: { products: Product[] }) {
  return (
    <Table
      data={products}
      keyExtractor={(p) => p.id}
      columns={[
        { key: 'name', header: 'Product Name' },
        { key: 'price', header: 'Price', render: (v) => `$${v}` },
        { key: 'inStock', header: 'Status', render: (v) => (v ? '✓' : '✗') },
      ]}
    />
  );
}

// -------------------------------------------------------------------------------------------
// 4. GENERIC CUSTOM HOOKS
// -------------------------------------------------------------------------------------------

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue((prev) => {
      const newValue = value instanceof Function ? value(prev) : value;
      localStorage.setItem(key, JSON.stringify(newValue));
      return newValue;
    });
  }, [key]);

  return [storedValue, setValue] as const;
}

// Usage - T is inferred from initialValue
function App() {
  const [user, setUser] = useLocalStorage('user', { name: '', age: 0 });
  // user is typed as { name: string; age: number }
}

// -------------------------------------------------------------------------------------------
// 5. GENERIC FETCH HOOK
// -------------------------------------------------------------------------------------------

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const data: T = await response.json();
        setState({ data, loading: false, error: null });
      } catch (error) {
        setState({ data: null, loading: false, error: error as Error });
      }
    };

    fetchData();
  }, [url]);

  return state;
}

// Usage with explicit type
interface Post {
  id: number;
  title: string;
  body: string;
}

function PostList() {
  const { data: posts, loading, error } = useFetch<Post[]>('/api/posts');
  // posts is typed as Post[] | null
}

// -------------------------------------------------------------------------------------------
// 6. GENERIC FORM COMPONENT
// -------------------------------------------------------------------------------------------

interface FormProps<T> {
  initialValues: T;
  onSubmit: (values: T) => void;
  children: (props: {
    values: T;
    setValue: <K extends keyof T>(key: K, value: T[K]) => void;
    handleSubmit: () => void;
  }) => ReactNode;
}

function Form<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  children,
}: FormProps<T>) {
  const [values, setValues] = useState<T>(initialValues);

  const setValue = <K extends keyof T>(key: K, value: T[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
  };

  const handleSubmit = () => onSubmit(values);

  return <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
    {children({ values, setValue, handleSubmit })}
  </form>;
}

// Usage
function LoginForm() {
  return (
    <Form
      initialValues={{ email: '', password: '' }}
      onSubmit={(values) => console.log(values)}
    >
      {({ values, setValue }) => (
        <>
          <input
            value={values.email}
            onChange={(e) => setValue('email', e.target.value)}
          />
          <input
            type="password"
            value={values.password}
            onChange={(e) => setValue('password', e.target.value)}
          />
          <button type="submit">Login</button>
        </>
      )}
    </Form>
  );
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY PATTERNS:
 * 1. Generic list/table components
 * 2. Generic select/dropdown components
 * 3. Generic custom hooks
 * 4. Generic form components
 *
 * BEST PRACTICES:
 * - Let TypeScript infer types when possible
 * - Use constraints (extends) for required properties
 * - Use keyof for type-safe property access
 * - Return 'as const' for tuple returns
 *
 * COMMON CONSTRAINTS:
 * - T extends object
 * - T extends { id: string }
 * - T extends Record<string, any>
 * - K extends keyof T
 */
