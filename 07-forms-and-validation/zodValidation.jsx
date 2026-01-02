/**
 * TOPIC: ZOD VALIDATION
 * DESCRIPTION:
 * Zod is a TypeScript-first schema validation library.
 * It provides type inference, composable schemas, and great DX.
 * npm install zod
 */

import { z } from 'zod';

// -------------------------------------------------------------------------------------------
// 1. BASIC SCHEMAS
// -------------------------------------------------------------------------------------------

// Primitive types
const stringSchema = z.string();
const numberSchema = z.number();
const booleanSchema = z.boolean();
const dateSchema = z.date();

// Parsing
const result = stringSchema.parse('hello'); // 'hello'
// stringSchema.parse(123); // Throws ZodError

// Safe parsing (doesn't throw)
const safeResult = stringSchema.safeParse('hello');
if (safeResult.success) {
  console.log(safeResult.data); // 'hello'
} else {
  console.log(safeResult.error); // ZodError
}

// -------------------------------------------------------------------------------------------
// 2. STRING VALIDATIONS
// -------------------------------------------------------------------------------------------

const emailSchema = z.string()
  .email('Invalid email')
  .min(5, 'Too short')
  .max(100, 'Too long');

const urlSchema = z.string().url('Invalid URL');

const passwordSchema = z.string()
  .min(8, 'Min 8 characters')
  .regex(/[A-Z]/, 'Need uppercase')
  .regex(/[a-z]/, 'Need lowercase')
  .regex(/[0-9]/, 'Need number')
  .regex(/[^A-Za-z0-9]/, 'Need special character');

const usernameSchema = z.string()
  .min(3)
  .max(20)
  .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores');

const trimmedSchema = z.string().trim(); // Trims whitespace
const lowercaseSchema = z.string().toLowerCase();

// -------------------------------------------------------------------------------------------
// 3. NUMBER VALIDATIONS
// -------------------------------------------------------------------------------------------

const ageSchema = z.number()
  .int('Must be integer')
  .min(0, 'Must be positive')
  .max(150, 'Invalid age');

const priceSchema = z.number()
  .positive('Must be positive')
  .multipleOf(0.01); // Currency precision

const percentSchema = z.number().min(0).max(100);

// Coercion from strings
const coercedNumber = z.coerce.number(); // '123' -> 123

// -------------------------------------------------------------------------------------------
// 4. OBJECT SCHEMAS
// -------------------------------------------------------------------------------------------

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18).optional(),
  role: z.enum(['user', 'admin', 'moderator']),
  metadata: z.object({
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
});

// Type inference
type User = z.infer<typeof userSchema>;

// Partial (all optional)
const partialUser = userSchema.partial();

// Pick specific fields
const loginSchema = userSchema.pick({ email: true });

// Omit fields
const publicUser = userSchema.omit({ role: true, metadata: true });

// Extend
const adminSchema = userSchema.extend({
  permissions: z.array(z.string()),
});

// Strict (no extra properties)
const strictUser = userSchema.strict();

// -------------------------------------------------------------------------------------------
// 5. ARRAY SCHEMAS
// -------------------------------------------------------------------------------------------

const tagsSchema = z.array(z.string())
  .min(1, 'At least one tag')
  .max(10, 'Max 10 tags');

const itemsSchema = z.array(z.object({
  name: z.string(),
  quantity: z.number().positive(),
})).nonempty();

// -------------------------------------------------------------------------------------------
// 6. UNION AND DISCRIMINATED UNIONS
// -------------------------------------------------------------------------------------------

// Simple union
const stringOrNumber = z.union([z.string(), z.number()]);

// Discriminated union (recommended)
const eventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('click'),
    x: z.number(),
    y: z.number(),
  }),
  z.object({
    type: z.literal('keypress'),
    key: z.string(),
  }),
  z.object({
    type: z.literal('scroll'),
    scrollY: z.number(),
  }),
]);

// -------------------------------------------------------------------------------------------
// 7. OPTIONAL, NULLABLE, DEFAULT
// -------------------------------------------------------------------------------------------

const optionalSchema = z.string().optional(); // string | undefined
const nullableSchema = z.string().nullable(); // string | null
const nullishSchema = z.string().nullish(); // string | null | undefined
const defaultSchema = z.string().default('default value');

// Transform
const transformSchema = z.string().transform((val) => val.toUpperCase());

// -------------------------------------------------------------------------------------------
// 8. CUSTOM VALIDATION
// -------------------------------------------------------------------------------------------

const customSchema = z.string().refine(
  (val) => val.startsWith('@'),
  { message: 'Must start with @' }
);

// Async validation
const asyncSchema = z.string().refine(
  async (val) => {
    const exists = await checkIfExists(val);
    return !exists;
  },
  { message: 'Already exists' }
);

// Superrefine for complex logic
const formSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Passwords must match',
      path: ['confirmPassword'],
    });
  }
});

// -------------------------------------------------------------------------------------------
// 9. WITH REACT HOOK FORM
// -------------------------------------------------------------------------------------------

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const registrationSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

type RegistrationForm = z.infer<typeof registrationSchema>;

function RegistrationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}

      <input {...register('confirmPassword')} type="password" />
      {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}

      <button type="submit">Register</button>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY FEATURES:
 * 1. TypeScript-first with type inference
 * 2. Composable and reusable schemas
 * 3. Built-in transformations
 * 4. Custom and async validations
 *
 * BEST PRACTICES:
 * - Use z.infer for type inference
 * - Compose schemas with pick/omit/extend
 * - Use discriminatedUnion for variants
 * - Use safeParse for error handling
 * - Share schemas between client/server
 *
 * INTEGRATIONS:
 * - @hookform/resolvers for React Hook Form
 * - trpc for type-safe APIs
 */
