/**
 * TOPIC: LIFTING STATE UP
 * DESCRIPTION:
 * When multiple components need to share state, lift it up to their
 * closest common ancestor. This maintains a single source of truth
 * and keeps components in sync.
 */

import { useState } from 'react';

// -------------------------------------------------------------------------------------------
// 1. BASIC STATE LIFTING
// -------------------------------------------------------------------------------------------

/**
 * Problem: Two components need to share and sync state.
 * Solution: Move state to parent, pass down as props.
 */

// Before: Each has its own state (not synced)
function UnsyncedInputs() {
  return (
    <div>
      <IndependentInput />
      <IndependentInput />
    </div>
  );
}

function IndependentInput() {
  const [value, setValue] = useState('');
  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}

// After: Shared state in parent (synced)
function SyncedInputs() {
  const [value, setValue] = useState('');

  return (
    <div>
      <ControlledInput value={value} onChange={setValue} />
      <ControlledInput value={value} onChange={setValue} />
    </div>
  );
}

function ControlledInput({ value, onChange }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />;
}

// -------------------------------------------------------------------------------------------
// 2. TEMPERATURE CONVERTER EXAMPLE
// -------------------------------------------------------------------------------------------

function TemperatureCalculator() {
  const [temperature, setTemperature] = useState('');
  const [scale, setScale] = useState('c');

  const celsius = scale === 'f' ? tryConvert(temperature, toCelsius) : temperature;
  const fahrenheit = scale === 'c' ? tryConvert(temperature, toFahrenheit) : temperature;

  const handleCelsiusChange = (value) => {
    setScale('c');
    setTemperature(value);
  };

  const handleFahrenheitChange = (value) => {
    setScale('f');
    setTemperature(value);
  };

  return (
    <div>
      <TemperatureInput
        scale="Celsius"
        temperature={celsius}
        onTemperatureChange={handleCelsiusChange}
      />
      <TemperatureInput
        scale="Fahrenheit"
        temperature={fahrenheit}
        onTemperatureChange={handleFahrenheitChange}
      />
      <BoilingVerdict celsius={parseFloat(celsius)} />
    </div>
  );
}

function TemperatureInput({ scale, temperature, onTemperatureChange }) {
  return (
    <fieldset>
      <legend>Temperature in {scale}</legend>
      <input
        value={temperature}
        onChange={(e) => onTemperatureChange(e.target.value)}
      />
    </fieldset>
  );
}

function BoilingVerdict({ celsius }) {
  if (celsius >= 100) return <p>Water would boil.</p>;
  return <p>Water would not boil.</p>;
}

function toCelsius(f) { return (f - 32) * 5 / 9; }
function toFahrenheit(c) { return c * 9 / 5 + 32; }
function tryConvert(temp, convert) {
  const input = parseFloat(temp);
  if (Number.isNaN(input)) return '';
  return Math.round(convert(input) * 1000) / 1000 + '';
}

// -------------------------------------------------------------------------------------------
// 3. INVERSE DATA FLOW
// -------------------------------------------------------------------------------------------

/**
 * Parent passes callback to child.
 * Child calls callback with data.
 * Parent updates state, re-renders children.
 */

function TodoApp() {
  const [todos, setTodos] = useState([]);

  const addTodo = (text) => {
    setTodos([...todos, { id: Date.now(), text, completed: false }]);
  };

  const toggleTodo = (id) => {
    setTodos(todos.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  return (
    <div>
      <AddTodoForm onAdd={addTodo} />
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
      <TodoStats todos={todos} />
    </div>
  );
}

function AddTodoForm({ onAdd }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button type="submit">Add</button>
    </form>
  );
}

function TodoList({ todos, onToggle, onDelete }) {
  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );
}

function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li>
      <input type="checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)} />
      <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>{todo.text}</span>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </li>
  );
}

function TodoStats({ todos }) {
  const completed = todos.filter((t) => t.completed).length;
  return <p>{completed} of {todos.length} completed</p>;
}

// -------------------------------------------------------------------------------------------
// 4. WHEN TO LIFT STATE
// -------------------------------------------------------------------------------------------

/**
 * LIFT STATE WHEN:
 * - Multiple components need the same data
 * - Components need to stay in sync
 * - One component affects another
 *
 * KEEP STATE LOCAL WHEN:
 * - Only one component uses it
 * - It doesn't affect other components
 * - It's temporary (form input before submit)
 */

// -------------------------------------------------------------------------------------------
// 5. STATE LIFTING VS CONTEXT
// -------------------------------------------------------------------------------------------

/**
 * LIFT STATE: 1-2 levels deep, few components
 * CONTEXT: Many components, deep nesting
 */

// State lifting: Good for shallow trees
function Parent() {
  const [value, setValue] = useState('');
  return <Child value={value} onChange={setValue} />;
}

// Context: Good for deep trees or many consumers
// See contextAPI.js for context examples

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Lift state to closest common ancestor
 * 2. Pass state down via props
 * 3. Pass callbacks up for child-to-parent communication
 * 4. Keep single source of truth
 *
 * BEST PRACTICES:
 * - Only lift state when needed
 * - Keep state as low as possible
 * - Consider Context for deep prop drilling
 * - Use useCallback for passed handlers
 */
