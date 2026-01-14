# React Practice Resource

A comprehensive collection of React concepts with production-ready examples and best practices. Each file follows a consistent educational format with detailed explanations and practical code examples.

## Structure

| Category                    | Files | Description                                              |
| --------------------------- | ----- | -------------------------------------------------------- |
| 01-core-concepts            | 7     | JSX, Components, Props, State, Events, Lifecycle, Setup  |
| 02-hooks                    | 15    | All built-in hooks including React 18/19 hooks           |
| 03-state-management         | 6     | Context API, useReducer, Zustand, Redux Toolkit, Jotai   |
| 04-component-patterns       | 9     | Composition, Render Props, HOCs, Compound, forwardRef    |
| 05-performance-optimization | 4     | React.memo, Code Splitting, Virtualization, Profiling    |
| 06-routing                  | 5     | React Router basics, Data APIs (v6.4+), Protected Routes |
| 07-forms-and-validation     | 4     | Controlled Forms, React Hook Form, Zod                   |
| 08-data-fetching            | 3     | TanStack Query, SWR, Fetch/Axios                         |
| 09-testing                  | 4     | React Testing Library, Hooks, Mocking, Integration       |
| 10-advanced-patterns        | 6     | Error Boundaries, Portals, Suspense, SSR, Accessibility  |
| 11-typescript-with-react    | 3     | Typing Components, Hooks, and Generics                   |
| 12-styling                  | 4     | CSS Modules, Tailwind CSS, Styled Components, Animations |
| 13-redux                    | 9     | Comprehensive Redux, Toolkit, RTK Query, Best Practices  |

**Total: 79 files**

## File Format

Each file follows this consistent format:

```javascript
/**
 * TOPIC: Topic Name
 * DESCRIPTION: Overview of the concept
 */

// ---------------------------
// 1. SECTION NAME
// ---------------------------

/**
 * Detailed explanation
 */

// Code examples...

// ---------------------------
// SUMMARY & BEST PRACTICES
// ---------------------------

/**
 * KEY POINTS:
 * 1. ...
 *
 * BEST PRACTICES:
 * - ...
 */
```

## Quick Links

### Core Concepts

- [JSX and Rendering](./01-core-concepts/jsxAndRendering.jsx)
- [Components and Props](./01-core-concepts/componentsAndProps.jsx)
- [State Basics](./01-core-concepts/stateBasics.jsx)
- [Conditional and List Rendering](./01-core-concepts/conditionalAndListRendering.jsx)
- [Event Handling](./01-core-concepts/eventHandling.jsx)
- [Lifecycle and Cleanup](./01-core-concepts/lifecycleAndCleanup.jsx)
- [Project Setup](./01-core-concepts/projectSetup.jsx)

### Hooks

- [useState](./02-hooks/useState.jsx)
- [useEffect](./02-hooks/useEffect.jsx)
- [useRef](./02-hooks/useRef.jsx)
- [useMemo](./02-hooks/useMemo.jsx)
- [useCallback](./02-hooks/useCallback.jsx)
- [useContext](./02-hooks/useContext.jsx)
- [useReducer](./02-hooks/useReducer.jsx)
- [useLayoutEffect](./02-hooks/useLayoutEffect.jsx)
- [useId](./02-hooks/useId.jsx)
- [useTransition](./02-hooks/useTransition.jsx)
- [useDeferredValue](./02-hooks/useDeferredValue.jsx)
- [useImperativeHandle](./02-hooks/useImperativeHandle.jsx)
- [useSyncExternalStore](./02-hooks/useSyncExternalStore.jsx)
- [useActionState (React 19)](./02-hooks/useActionState.jsx)
- [Custom Hooks](./02-hooks/customHooks.jsx)

### State Management

- [Lifting State Up](./03-state-management/liftingStateUp.jsx)
- [Context API](./03-state-management/contextAPI.jsx)
- [useReducer Patterns](./03-state-management/useReducerPatterns.jsx)
- [Zustand](./03-state-management/zustand.jsx)
- [Redux Toolkit](./03-state-management/reduxToolkit.jsx)
- [Jotai](./03-state-management/jotai.jsx)

### Redux (Comprehensive)

- [Core Redux Concepts](./13-redux/coreReduxConcepts.jsx)
- [createSlice (Toolkit)](./13-redux/createSlice.jsx)
- [Async Thunks](./13-redux/asyncThunks.jsx)
- [RTK Query](./13-redux/rtkQuery.jsx)
- [Middleware](./13-redux/reduxMiddleware.jsx)
- [Selectors & Reselect](./13-redux/selectorsAndReselect.jsx)
- [Redux with TypeScript](./13-redux/reduxWithTypeScript.jsx)
- [DevTools](./13-redux/reduxDevTools.jsx)
- [Best Practices](./13-redux/reduxBestPractices.jsx)

### Component Patterns

- [Composition vs Inheritance](./04-component-patterns/compositionVsInheritance.jsx)
- [Render Props](./04-component-patterns/renderProps.jsx)
- [Higher-Order Components](./04-component-patterns/higherOrderComponents.jsx)
- [Compound Components](./04-component-patterns/compoundComponents.jsx)
- [Controlled vs Uncontrolled](./04-component-patterns/controlledVsUncontrolled.jsx)
- [Props Children](./04-component-patterns/propsChildren.jsx)
- [Slots Pattern](./04-component-patterns/slots.jsx)
- [Headless Components](./04-component-patterns/headlessComponents.jsx)
- [forwardRef](./04-component-patterns/forwardRef.jsx)

### Performance Optimization

- [React.memo](./05-performance-optimization/reactMemo.jsx)
- [Code Splitting](./05-performance-optimization/codeSplitting.jsx)
- [Virtualization](./05-performance-optimization/virtualization.jsx)
- [Profiling](./05-performance-optimization/profiling.jsx)

### Routing

- [Basic Routing](./06-routing/basicRouting.jsx)
- [Nested Routes](./06-routing/nestedRoutes.jsx)
- [Protected Routes](./06-routing/protectedRoutes.jsx)
- [Route Hooks](./06-routing/routeHooks.jsx)
- [Data Routing (v6.4+)](./06-routing/dataRouting.jsx)

### Forms and Validation

- [Controlled Forms](./07-forms-and-validation/controlledForms.jsx)
- [React Hook Form](./07-forms-and-validation/reactHookForm.jsx)
- [Zod Validation](./07-forms-and-validation/zodValidation.jsx)
- [Form Patterns](./07-forms-and-validation/formPatterns.jsx)

### Data Fetching

- [TanStack Query](./08-data-fetching/tanstackQuery.jsx)
- [SWR](./08-data-fetching/swr.jsx)
- [Fetch and Axios](./08-data-fetching/fetchAndAxios.jsx)

### Testing

- [React Testing Library](./09-testing/reactTestingLibrary.jsx)
- [Testing Hooks](./09-testing/testingHooks.jsx)
- [Mocking](./09-testing/mocking.jsx)
- [Integration Testing](./09-testing/integrationTesting.jsx)

### Advanced Patterns

- [Error Boundaries](./10-advanced-patterns/errorBoundaries.jsx)
- [Portals](./10-advanced-patterns/portals.jsx)
- [Suspense](./10-advanced-patterns/suspense.jsx)
- [Server Components](./10-advanced-patterns/serverComponents.jsx)
- [Strict Mode](./10-advanced-patterns/strictMode.jsx)
- [Accessibility](./10-advanced-patterns/accessibility.jsx)

### TypeScript with React

- [Typing Components](./11-typescript-with-react/typingComponents.jsx)
- [Typing Hooks](./11-typescript-with-react/typingHooks.jsx)
- [Generics in React](./11-typescript-with-react/genericsInReact.jsx)

### Styling

- [CSS Modules](./12-styling/cssModules.jsx)
- [Tailwind CSS](./12-styling/tailwindCSS.jsx)
- [Styled Components](./12-styling/styledComponents.jsx)
- [Animations](./12-styling/animations.jsx)

## Prerequisites

- JavaScript ES6+ knowledge
- Node.js and npm installed
- Basic understanding of React concepts

## Usage

Each file is self-contained with examples. To use in a project:

1. Create a React project: `npm create vite@latest my-app -- --template react`
2. Copy any file's examples into your project
3. Install any required dependencies mentioned in the file

## Dependencies by Topic

Some files reference external libraries:

| Topic            | Dependencies                                                 |
| ---------------- | ------------------------------------------------------------ |
| State Management | `zustand`, `@reduxjs/toolkit`, `react-redux`, `jotai`        |
| Redux            | `@reduxjs/toolkit`, `react-redux`                            |
| Routing          | `react-router-dom`                                           |
| Forms            | `react-hook-form`, `@hookform/resolvers`, `zod`              |
| Data Fetching    | `@tanstack/react-query`, `swr`, `axios`                      |
| Testing          | `@testing-library/react`, `@testing-library/jest-dom`, `msw` |
| Styling          | `tailwindcss`, `styled-components`, `framer-motion`, `clsx`  |

## React Version Coverage

This resource covers React 17, 18, and 19 features including:

- React 18 concurrent features (useTransition, useDeferredValue)
- React 18 automatic batching
- React 19 hooks (useActionState, useFormStatus, useOptimistic)
- Server Components (Next.js 13+)
