/**
 * TOPIC: FORM PATTERNS
 * DESCRIPTION:
 * Common form patterns and best practices for building
 * robust, accessible, and user-friendly forms in React.
 */

import { useState, useRef, useEffect } from 'react';

// -------------------------------------------------------------------------------------------
// 1. MULTI-STEP FORM
// -------------------------------------------------------------------------------------------

function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    name: '',
    email: '',
    // Step 2
    address: '',
    city: '',
    // Step 3
    cardNumber: '',
    expiry: '',
  });

  const updateFields = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 3) {
      next();
    } else {
      console.log('Submit:', formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ProgressBar current={step} total={3} />

      {step === 1 && (
        <PersonalInfo data={formData} updateFields={updateFields} />
      )}
      {step === 2 && (
        <AddressInfo data={formData} updateFields={updateFields} />
      )}
      {step === 3 && (
        <PaymentInfo data={formData} updateFields={updateFields} />
      )}

      <div className="buttons">
        {step > 1 && <button type="button" onClick={back}>Back</button>}
        <button type="submit">{step === 3 ? 'Submit' : 'Next'}</button>
      </div>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 2. DEBOUNCED INPUT
// -------------------------------------------------------------------------------------------

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function SearchForm({ onSearch }) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  return (
    <input
      type="search"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}

// -------------------------------------------------------------------------------------------
// 3. AUTO-SAVE FORM
// -------------------------------------------------------------------------------------------

function AutoSaveForm() {
  const [data, setData] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Debounce and auto-save
  useEffect(() => {
    const timer = setTimeout(async () => {
      setSaving(true);
      await saveToServer(data);
      setSaving(false);
      setLastSaved(new Date());
    }, 1000);

    return () => clearTimeout(timer);
  }, [data]);

  return (
    <form>
      <input
        value={data.title}
        onChange={(e) => setData({ ...data, title: e.target.value })}
      />
      <textarea
        value={data.content}
        onChange={(e) => setData({ ...data, content: e.target.value })}
      />
      <div className="status">
        {saving && <span>Saving...</span>}
        {lastSaved && !saving && (
          <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
        )}
      </div>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 4. DEPENDENT FIELDS
// -------------------------------------------------------------------------------------------

function DependentFieldsForm() {
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [states, setStates] = useState([]);

  // Load states when country changes
  useEffect(() => {
    if (country) {
      fetchStates(country).then(setStates);
      setState(''); // Reset state when country changes
    }
  }, [country]);

  return (
    <form>
      <select value={country} onChange={(e) => setCountry(e.target.value)}>
        <option value="">Select Country</option>
        <option value="US">United States</option>
        <option value="CA">Canada</option>
      </select>

      <select
        value={state}
        onChange={(e) => setState(e.target.value)}
        disabled={!country}
      >
        <option value="">Select State</option>
        {states.map((s) => (
          <option key={s.code} value={s.code}>{s.name}</option>
        ))}
      </select>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 5. INLINE EDITING
// -------------------------------------------------------------------------------------------

function InlineEdit({ value, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  if (isEditing) {
    return (
      <div className="inline-edit">
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
        />
      </div>
    );
  }

  return (
    <span onClick={() => setIsEditing(true)} className="editable">
      {value} ✏️
    </span>
  );
}

// -------------------------------------------------------------------------------------------
// 6. FORM WITH CONFIRMATION
// -------------------------------------------------------------------------------------------

function ConfirmableForm() {
  const [data, setData] = useState({ email: '' });
  const [step, setStep] = useState('edit'); // 'edit' | 'confirm' | 'success'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 'edit') {
      setStep('confirm');
    } else if (step === 'confirm') {
      // Actually submit
      submitForm(data).then(() => setStep('success'));
    }
  };

  if (step === 'success') {
    return <div>Form submitted successfully!</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {step === 'edit' && (
        <input
          value={data.email}
          onChange={(e) => setData({ email: e.target.value })}
          placeholder="Email"
        />
      )}

      {step === 'confirm' && (
        <div>
          <p>Confirm your email: <strong>{data.email}</strong></p>
          <button type="button" onClick={() => setStep('edit')}>Edit</button>
        </div>
      )}

      <button type="submit">
        {step === 'edit' ? 'Continue' : 'Confirm & Submit'}
      </button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 7. ACCESSIBLE FORM
// -------------------------------------------------------------------------------------------

function AccessibleForm() {
  const [errors, setErrors] = useState({});

  return (
    <form aria-label="Contact form">
      <div className="field">
        <label htmlFor="name">Name *</label>
        <input
          id="name"
          name="name"
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <span id="name-error" role="alert" className="error">
            {errors.name}
          </span>
        )}
      </div>

      <div className="field">
        <label htmlFor="email">Email *</label>
        <input
          id="email"
          name="email"
          type="email"
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby="email-hint email-error"
        />
        <span id="email-hint" className="hint">
          We'll never share your email
        </span>
        {errors.email && (
          <span id="email-error" role="alert" className="error">
            {errors.email}
          </span>
        )}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * PATTERNS COVERED:
 * 1. Multi-step forms with shared state
 * 2. Debounced inputs for search/filter
 * 3. Auto-save for drafts
 * 4. Dependent/cascading fields
 * 5. Inline editing
 * 6. Confirmation before submit
 * 7. Accessible forms
 *
 * BEST PRACTICES:
 * - Show clear validation feedback
 * - Use proper labels and ARIA attributes
 * - Handle loading and error states
 * - Debounce expensive operations
 * - Preserve data across steps
 */
