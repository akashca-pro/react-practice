/**
 * TOPIC: REACT 19 HOOKS - useActionState AND useFormStatus
 * DESCRIPTION:
 * React 19 introduces new hooks for handling form actions and transitions.
 * These hooks simplify form handling with built-in pending states and
 * progressive enhancement.
 */

import { useActionState, useFormStatus, useOptimistic } from 'react';

// -------------------------------------------------------------------------------------------
// 1. useActionState (formerly useFormState)
// -------------------------------------------------------------------------------------------

/**
 * useActionState manages state for form actions.
 * It provides pending state and error handling automatically.
 */

async function submitForm(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    await login(email, password);
    return { success: true, message: 'Logged in!' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

function LoginForm() {
  const [state, formAction, isPending] = useActionState(submitForm, null);

  return (
    <form action={formAction}>
      <input name="email" type="email" required disabled={isPending} />
      <input name="password" type="password" required disabled={isPending} />

      <button type="submit" disabled={isPending}>
        {isPending ? 'Logging in...' : 'Login'}
      </button>

      {state?.message && (
        <p className={state.success ? 'success' : 'error'}>
          {state.message}
        </p>
      )}
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 2. useFormStatus
// -------------------------------------------------------------------------------------------

/**
 * useFormStatus returns the status of the parent <form>.
 * Must be used inside a component that's rendered within a <form>.
 */

function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  );
}

function Form() {
  return (
    <form action={handleSubmit}>
      <input name="message" />
      <SubmitButton /> {/* Has access to form status */}
    </form>
  );
}

// Form status in various components
function FormProgress() {
  const { pending } = useFormStatus();
  return pending ? <div className="progress-bar" /> : null;
}

function FormInputs() {
  const { pending } = useFormStatus();

  return (
    <>
      <input name="title" disabled={pending} />
      <textarea name="content" disabled={pending} />
    </>
  );
}

// -------------------------------------------------------------------------------------------
// 3. useOptimistic
// -------------------------------------------------------------------------------------------

/**
 * useOptimistic enables optimistic UI updates.
 * Shows expected result immediately, reverts if action fails.
 */

function TodoList({ todos, addTodo }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo) => [...state, { ...newTodo, pending: true }]
  );

  async function handleSubmit(formData) {
    const text = formData.get('todo');
    const newTodo = { id: Date.now(), text };

    // Optimistically add to list
    addOptimisticTodo(newTodo);

    // Actually add (server will confirm or fail)
    await addTodo(newTodo);
  }

  return (
    <div>
      <form action={handleSubmit}>
        <input name="todo" />
        <button type="submit">Add</button>
      </form>

      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>
            {todo.text}
            {todo.pending && ' (saving...)'}
          </li>
        ))}
      </ul>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 4. COMBINING HOOKS
// -------------------------------------------------------------------------------------------

function CreatePostForm({ posts, addPost }) {
  const [optimisticPosts, addOptimisticPost] = useOptimistic(
    posts,
    (state, newPost) => [{ ...newPost, pending: true }, ...state]
  );

  async function createPost(prevState, formData) {
    const title = formData.get('title');
    const content = formData.get('content');

    const newPost = { id: Date.now(), title, content };
    addOptimisticPost(newPost);

    try {
      await addPost(newPost);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  const [state, formAction] = useActionState(createPost, null);

  return (
    <div>
      <form action={formAction}>
        <input name="title" placeholder="Title" required />
        <textarea name="content" placeholder="Content" required />
        <SubmitButton />
        {state?.error && <p className="error">{state.error}</p>}
      </form>

      <ul>
        {optimisticPosts.map((post) => (
          <li key={post.id} className={post.pending ? 'pending' : ''}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 5. USE WITH SERVER ACTIONS
// -------------------------------------------------------------------------------------------

/**
 * These hooks work seamlessly with Server Actions in Next.js.
 */

// app/actions.js
'use server';

export async function submitContact(prevState, formData) {
  const email = formData.get('email');
  const message = formData.get('message');

  // Server-side validation
  if (!email || !message) {
    return { error: 'All fields required' };
  }

  // Save to database
  await db.contacts.create({ email, message });

  return { success: true };
}

// app/contact/page.jsx
'use client';

import { submitContact } from './actions';

function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContact, null);

  return (
    <form action={formAction}>
      <input name="email" type="email" />
      <textarea name="message" />
      <button disabled={isPending}>Send</button>
      {state?.error && <p>{state.error}</p>}
      {state?.success && <p>Message sent!</p>}
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// 6. PROGRESSIVE ENHANCEMENT
// -------------------------------------------------------------------------------------------

/**
 * Forms work without JavaScript!
 * - Action runs on server by default
 * - JavaScript enhances with pending states
 */

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * REACT 19 FORM HOOKS:
 * 1. useActionState - Form action state management
 * 2. useFormStatus - Parent form status
 * 3. useOptimistic - Optimistic UI updates
 *
 * KEY FEATURES:
 * - Built-in pending states
 * - Automatic error handling
 * - Progressive enhancement
 * - Works with Server Actions
 *
 * BEST PRACTICES:
 * - Use useFormStatus in child components
 * - Combine useOptimistic for instant feedback
 * - Handle errors in action functions
 * - Keep actions simple and focused
 */
