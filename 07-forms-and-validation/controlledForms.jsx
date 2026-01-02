/**
 * TOPIC: CONTROLLED FORMS
 * DESCRIPTION:
 * Controlled forms use React state as the source of truth.
 * Every form field value is controlled by state and updated via onChange.
 */

import { useState, useCallback } from 'react';

// -------------------------------------------------------------------------------------------
// 1. BASIC CONTROLLED FORM
// -------------------------------------------------------------------------------------------

function BasicForm() {
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
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
      />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />
      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Message"
      />
      <button type="submit">Submit</button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 2. DIFFERENT INPUT TYPES
// -------------------------------------------------------------------------------------------

function AllInputTypes() {
  const [form, setForm] = useState({
    text: '',
    email: '',
    password: '',
    number: 0,
    checkbox: false,
    radio: '',
    select: '',
    multiSelect: [],
    textarea: '',
    date: '',
    range: 50,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleMultiSelect = (e) => {
    const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setForm((prev) => ({ ...prev, multiSelect: values }));
  };

  return (
    <form>
      <input type="text" name="text" value={form.text} onChange={handleChange} />
      <input type="email" name="email" value={form.email} onChange={handleChange} />
      <input type="password" name="password" value={form.password} onChange={handleChange} />
      <input type="number" name="number" value={form.number} onChange={handleChange} />
      <input type="date" name="date" value={form.date} onChange={handleChange} />
      <input type="range" name="range" value={form.range} onChange={handleChange} min="0" max="100" />

      <input
        type="checkbox"
        name="checkbox"
        checked={form.checkbox}
        onChange={handleChange}
      />

      <label>
        <input type="radio" name="radio" value="a" checked={form.radio === 'a'} onChange={handleChange} />
        Option A
      </label>
      <label>
        <input type="radio" name="radio" value="b" checked={form.radio === 'b'} onChange={handleChange} />
        Option B
      </label>

      <select name="select" value={form.select} onChange={handleChange}>
        <option value="">Select...</option>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </select>

      <select name="multiSelect" multiple value={form.multiSelect} onChange={handleMultiSelect}>
        <option value="a">A</option>
        <option value="b">B</option>
        <option value="c">C</option>
      </select>

      <textarea name="textarea" value={form.textarea} onChange={handleChange} />
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 3. CUSTOM FORM HOOK
// -------------------------------------------------------------------------------------------

function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleBlur = useCallback((e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  }, []);

  const setValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setTouched({});
    setErrors({});
  }, [initialValues]);

  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
  }), [values, handleChange, handleBlur]);

  return {
    values,
    touched,
    errors,
    handleChange,
    handleBlur,
    setValue,
    setErrors,
    reset,
    getFieldProps,
  };
}

// Usage
function FormWithHook() {
  const { values, getFieldProps, reset } = useForm({
    email: '',
    password: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(values);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input {...getFieldProps('email')} type="email" />
      <input {...getFieldProps('password')} type="password" />
      <button type="submit">Submit</button>
      <button type="button" onClick={reset}>Reset</button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 4. VALIDATION
// -------------------------------------------------------------------------------------------

function ValidatedForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (values) => {
    const newErrors = {};
    if (!values.email) {
      newErrors.email = 'Required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = 'Invalid email';
    }
    if (!values.password) {
      newErrors.password = 'Required';
    } else if (values.password.length < 8) {
      newErrors.password = 'Must be at least 8 characters';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    setForm(newForm);
    setErrors(validate(newForm));
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    setTouched({ email: true, password: true });

    if (Object.keys(validationErrors).length === 0) {
      console.log('Valid form:', form);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.email && errors.email && <span className="error">{errors.email}</span>}
      </div>
      <div>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.password && errors.password && <span className="error">{errors.password}</span>}
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 5. DYNAMIC FIELDS
// -------------------------------------------------------------------------------------------

function DynamicForm() {
  const [items, setItems] = useState([{ name: '', quantity: 1 }]);

  const addItem = () => {
    setItems([...items, { name: '', quantity: 1 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    setItems(items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  return (
    <form>
      {items.map((item, index) => (
        <div key={index}>
          <input
            value={item.name}
            onChange={(e) => updateItem(index, 'name', e.target.value)}
            placeholder="Item name"
          />
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
          />
          <button type="button" onClick={() => removeItem(index)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={addItem}>Add Item</button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. State is source of truth for all inputs
 * 2. onChange updates state, value reflects state
 * 3. Handle different input types appropriately
 * 4. Create reusable form hooks
 *
 * BEST PRACTICES:
 * - Use a single handleChange for all inputs
 * - Track touched state for validation UX
 * - Validate on blur and on submit
 * - Use custom hooks for reusable form logic
 * - Consider form libraries for complex forms
 */
