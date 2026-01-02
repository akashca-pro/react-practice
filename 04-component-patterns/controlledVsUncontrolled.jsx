/**
 * TOPIC: CONTROLLED VS UNCONTROLLED COMPONENTS
 * DESCRIPTION:
 * Controlled components have their state managed by React via props.
 * Uncontrolled components manage their own state internally via DOM.
 * Understanding when to use each is important for form handling.
 */

import { useState, useRef } from 'react';

// -------------------------------------------------------------------------------------------
// 1. CONTROLLED COMPONENTS
// -------------------------------------------------------------------------------------------

/**
 * Controlled: React state is the "single source of truth"
 * The component receives its current value and update callback via props.
 */

function ControlledInput() {
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
    />
  );
}

// Controlled form
function ControlledForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={formData.name} onChange={handleChange} />
      <input name="email" value={formData.email} onChange={handleChange} />
      <textarea name="message" value={formData.message} onChange={handleChange} />
      <button type="submit">Submit</button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 2. UNCONTROLLED COMPONENTS
// -------------------------------------------------------------------------------------------

/**
 * Uncontrolled: DOM is the source of truth
 * Use refs to access values when needed.
 */

function UncontrolledInput() {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Value:', inputRef.current.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" ref={inputRef} defaultValue="initial" />
      <button type="submit">Submit</button>
    </form>
  );
}

// Uncontrolled form
function UncontrolledForm() {
  const formRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(formRef.current);
    console.log({
      name: formData.get('name'),
      email: formData.get('email'),
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input name="name" defaultValue="" />
      <input name="email" type="email" defaultValue="" />
      <button type="submit">Submit</button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 3. WHEN TO USE EACH
// -------------------------------------------------------------------------------------------

/**
 * USE CONTROLLED WHEN:
 * - Need real-time validation
 * - Need to disable submit until form is valid
 * - Need to format input values (e.g., phone numbers)
 * - Need conditional fields based on input
 * - Need to sync with other UI elements
 *
 * USE UNCONTROLLED WHEN:
 * - Simple forms with no validation
 * - File inputs (must be uncontrolled)
 * - Integration with non-React code
 * - Performance concerns with many inputs
 */

// -------------------------------------------------------------------------------------------
// 4. FILE INPUTS (ALWAYS UNCONTROLLED)
// -------------------------------------------------------------------------------------------

function FileInput() {
  const fileRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const file = fileRef.current.files[0];
    console.log('Selected file:', file);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" ref={fileRef} />
      <button type="submit">Upload</button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 5. HYBRID APPROACH
// -------------------------------------------------------------------------------------------

/**
 * Some components support both controlled and uncontrolled modes.
 */

function HybridInput({ value: controlledValue, defaultValue, onChange }) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');

  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (e) => {
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
    onChange?.(e.target.value);
  };

  return <input value={value} onChange={handleChange} />;
}

// Can be used controlled
<HybridInput value={name} onChange={setName} />

// Or uncontrolled
<HybridInput defaultValue="initial" />

// -------------------------------------------------------------------------------------------
// 6. CONTROLLED COMPONENT PATTERNS
// -------------------------------------------------------------------------------------------

// Real-time validation
function ValidatedInput() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setError(value.includes('@') ? '' : 'Invalid email');
  };

  return (
    <div>
      <input value={email} onChange={handleChange} />
      {error && <span className="error">{error}</span>}
    </div>
  );
}

// Formatting input
function PhoneInput() {
  const [phone, setPhone] = useState('');

  const handleChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    const formatted = digits.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    setPhone(formatted);
  };

  return <input value={phone} onChange={handleChange} placeholder="(123) 456-7890" />;
}

// -------------------------------------------------------------------------------------------
// 7. COMPARISON TABLE
// -------------------------------------------------------------------------------------------

/**
 * Feature                  | Controlled | Uncontrolled
 * -------------------------|------------|---------------
 * One-time value retrieval | ✓          | ✓
 * Validating on submit     | ✓          | ✓
 * Instant field validation | ✓          | ✗
 * Conditionally disable    | ✓          | ✗
 * Enforce input format     | ✓          | ✗
 * Several inputs for one   | ✓          | ✗
 * Dynamic inputs           | ✓          | ✗
 */

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Controlled = React state is source of truth
 * 2. Uncontrolled = DOM is source of truth
 * 3. Use controlled for complex forms
 * 4. Use uncontrolled for simple cases
 *
 * BEST PRACTICES:
 * - Default to controlled components
 * - Use uncontrolled only when necessary
 * - File inputs must be uncontrolled
 * - Support both modes for reusable components
 */
