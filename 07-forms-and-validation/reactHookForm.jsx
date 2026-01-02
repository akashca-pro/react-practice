/**
 * TOPIC: REACT HOOK FORM
 * DESCRIPTION:
 * React Hook Form is a performant form library with minimal re-renders.
 * It uses uncontrolled inputs and refs for better performance.
 * npm install react-hook-form
 */

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// -------------------------------------------------------------------------------------------
// 1. BASIC USAGE
// -------------------------------------------------------------------------------------------

function BasicForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    console.log(data);
    await saveData(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('firstName', { required: 'First name is required' })} />
      {errors.firstName && <span>{errors.firstName.message}</span>}

      <input {...register('email', {
        required: 'Email is required',
        pattern: {
          value: /^\S+@\S+$/i,
          message: 'Invalid email format',
        },
      })} />
      {errors.email && <span>{errors.email.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 2. VALIDATION RULES
// -------------------------------------------------------------------------------------------

function ValidationForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <input {...register('name', {
        required: 'Name is required',
        minLength: { value: 2, message: 'Min 2 characters' },
        maxLength: { value: 50, message: 'Max 50 characters' },
      })} />

      <input {...register('age', {
        required: 'Age is required',
        min: { value: 18, message: 'Must be at least 18' },
        max: { value: 120, message: 'Invalid age' },
        valueAsNumber: true, // Convert to number
      })} type="number" />

      <input {...register('email', {
        required: 'Email is required',
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: 'Invalid email',
        },
      })} />

      <input {...register('password', {
        required: 'Password is required',
        minLength: { value: 8, message: 'Min 8 characters' },
        validate: {
          hasUppercase: (v) => /[A-Z]/.test(v) || 'Need uppercase letter',
          hasLowercase: (v) => /[a-z]/.test(v) || 'Need lowercase letter',
          hasNumber: (v) => /\d/.test(v) || 'Need a number',
        },
      })} type="password" />

      <input {...register('confirmPassword', {
        required: 'Confirm password',
        validate: (value, formValues) =>
          value === formValues.password || 'Passwords must match',
      })} type="password" />

      <button type="submit">Submit</button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 3. ZOD SCHEMA VALIDATION
// -------------------------------------------------------------------------------------------

const schema = z.object({
  name: z.string().min(2, 'Min 2 characters'),
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18+'),
  password: z.string()
    .min(8, 'Min 8 characters')
    .regex(/[A-Z]/, 'Need uppercase')
    .regex(/[0-9]/, 'Need number'),
});

function ZodForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('age', { valueAsNumber: true })} type="number" />
      {errors.age && <span>{errors.age.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 4. CONTROLLER FOR CUSTOM COMPONENTS
// -------------------------------------------------------------------------------------------

/**
 * Use Controller for controlled components like UI libraries.
 */

function ControllerForm() {
  const { control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <Controller
        name="category"
        control={control}
        rules={{ required: 'Category is required' }}
        render={({ field, fieldState: { error } }) => (
          <div>
            <Select {...field} options={categoryOptions} />
            {error && <span>{error.message}</span>}
          </div>
        )}
      />

      <Controller
        name="startDate"
        control={control}
        render={({ field }) => (
          <DatePicker
            selected={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <button type="submit">Submit</button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 5. FIELD ARRAYS (DYNAMIC FIELDS)
// -------------------------------------------------------------------------------------------

function DynamicForm() {
  const { register, control, handleSubmit } = useForm({
    defaultValues: { items: [{ name: '', quantity: 1 }] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...register(`items.${index}.name`)} placeholder="Name" />
          <input {...register(`items.${index}.quantity`, { valueAsNumber: true })} type="number" />
          <button type="button" onClick={() => remove(index)}>Remove</button>
        </div>
      ))}

      <button type="button" onClick={() => append({ name: '', quantity: 1 })}>
        Add Item
      </button>
      <button type="submit">Submit</button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 6. FORM STATE
// -------------------------------------------------------------------------------------------

function FormStateDemo() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: {
      errors,
      isDirty,
      dirtyFields,
      touchedFields,
      isSubmitting,
      isSubmitted,
      isValid,
      submitCount,
    },
  } = useForm({ mode: 'onChange' }); // Validate on change

  // Watch specific field
  const watchEmail = watch('email');

  // Watch all fields
  const watchAll = watch();

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <input {...register('name')} />
      <input {...register('email')} />

      <div>
        <p>Is Dirty: {isDirty ? 'Yes' : 'No'}</p>
        <p>Is Valid: {isValid ? 'Yes' : 'No'}</p>
        <p>Submit Count: {submitCount}</p>
      </div>

      <button type="button" onClick={() => setValue('email', 'test@example.com')}>
        Set Email
      </button>
      <button type="button" onClick={() => reset()}>Reset</button>
      <button type="submit">Submit</button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 7. DEFAULT VALUES
// -------------------------------------------------------------------------------------------

function EditForm({ defaultValues }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues, // Set initial values
  });

  // Reset with new values when they change
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <input {...register('name')} />
      <input {...register('email')} />
      <button type="submit">Update</button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY FEATURES:
 * 1. Minimal re-renders (uncontrolled inputs)
 * 2. Built-in validation
 * 3. Schema validation with Zod/Yup
 * 4. Easy field arrays
 *
 * BEST PRACTICES:
 * - Use register for native inputs
 * - Use Controller for custom components
 * - Use Zod for complex validation
 * - Use mode: 'onBlur' for better UX
 * - Reset form when default values change
 *
 * VALIDATION MODES:
 * - onSubmit (default)
 * - onBlur
 * - onChange
 * - onTouched
 * - all
 */
