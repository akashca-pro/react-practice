/**
 * TOPIC: useReducer PATTERNS
 * DESCRIPTION:
 * Advanced patterns for managing complex state with useReducer.
 * Covers action types, reducers organization, and combining with Context.
 */

import { useReducer, createContext, useContext, useMemo, useCallback } from 'react';

// -------------------------------------------------------------------------------------------
// 1. ACTION TYPE CONSTANTS
// -------------------------------------------------------------------------------------------

// Define action types as constants
const ActionTypes = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_ERROR: 'FETCH_ERROR',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  DELETE_ITEM: 'DELETE_ITEM',
  RESET: 'RESET',
};

function dataReducer(state, action) {
  switch (action.type) {
    case ActionTypes.FETCH_START:
      return { ...state, loading: true, error: null };
    case ActionTypes.FETCH_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case ActionTypes.FETCH_ERROR:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

// -------------------------------------------------------------------------------------------
// 2. ACTION CREATORS
// -------------------------------------------------------------------------------------------

const actions = {
  fetchStart: () => ({ type: ActionTypes.FETCH_START }),
  fetchSuccess: (data) => ({ type: ActionTypes.FETCH_SUCCESS, payload: data }),
  fetchError: (error) => ({ type: ActionTypes.FETCH_ERROR, payload: error }),
  addItem: (item) => ({ type: ActionTypes.ADD_ITEM, payload: item }),
  updateItem: (id, updates) => ({ type: ActionTypes.UPDATE_ITEM, payload: { id, updates } }),
  deleteItem: (id) => ({ type: ActionTypes.DELETE_ITEM, payload: id }),
};

function useData() {
  const [state, dispatch] = useReducer(dataReducer, {
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async (url) => {
    dispatch(actions.fetchStart());
    try {
      const response = await fetch(url);
      const data = await response.json();
      dispatch(actions.fetchSuccess(data));
    } catch (error) {
      dispatch(actions.fetchError(error.message));
    }
  }, []);

  return { ...state, fetchData };
}

// -------------------------------------------------------------------------------------------
// 3. IMMER-STYLE UPDATES
// -------------------------------------------------------------------------------------------

/**
 * For complex nested state, consider using Immer library.
 * It allows "mutating" syntax while producing immutable updates.
 */

import { produce } from 'immer'; // npm install immer

function immerReducer(state, action) {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'ADD_TODO':
        draft.todos.push(action.payload);
        break;
      case 'TOGGLE_TODO':
        const todo = draft.todos.find((t) => t.id === action.payload);
        if (todo) todo.completed = !todo.completed;
        break;
      case 'UPDATE_NESTED':
        draft.user.preferences.theme = action.payload;
        break;
    }
  });
}

// -------------------------------------------------------------------------------------------
// 4. REDUCER COMPOSITION
// -------------------------------------------------------------------------------------------

/**
 * Split large reducers into smaller, focused reducers.
 */

function todosReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, action.payload];
    case 'REMOVE_TODO':
      return state.filter((t) => t.id !== action.payload);
    default:
      return state;
  }
}

function filterReducer(state, action) {
  switch (action.type) {
    case 'SET_FILTER':
      return action.payload;
    default:
      return state;
  }
}

function combineReducers(reducers) {
  return (state, action) => {
    const newState = {};
    for (const key in reducers) {
      newState[key] = reducers[key](state[key], action);
    }
    return newState;
  };
}

const rootReducer = combineReducers({
  todos: todosReducer,
  filter: filterReducer,
});

// -------------------------------------------------------------------------------------------
// 5. REDUCER WITH CONTEXT
// -------------------------------------------------------------------------------------------

const TodoContext = createContext(null);

function TodoProvider({ children }) {
  const [state, dispatch] = useReducer(rootReducer, {
    todos: [],
    filter: 'all',
  });

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

function useTodos() {
  const context = useContext(TodoContext);
  if (!context) throw new Error('useTodos must be within TodoProvider');
  return context;
}

// -------------------------------------------------------------------------------------------
// 6. ASYNC ACTIONS PATTERN
// -------------------------------------------------------------------------------------------

/**
 * Handle async operations with useReducer.
 */

function createAsyncDispatch(dispatch) {
  return (action) => {
    if (typeof action === 'function') {
      return action(dispatch);
    }
    return dispatch(action);
  };
}

function asyncAction() {
  return async (dispatch) => {
    dispatch({ type: 'LOADING' });
    try {
      const data = await fetch('/api/data').then((r) => r.json());
      dispatch({ type: 'SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'ERROR', payload: error.message });
    }
  };
}

// Usage
function AsyncComponent() {
  const [state, baseDispatch] = useReducer(reducer, initialState);
  const dispatch = createAsyncDispatch(baseDispatch);

  const handleFetch = () => dispatch(asyncAction());
}

// -------------------------------------------------------------------------------------------
// 7. MIDDLEWARE PATTERN
// -------------------------------------------------------------------------------------------

function applyMiddleware(...middlewares) {
  return (dispatch) => {
    let enhancedDispatch = dispatch;

    middlewares.reverse().forEach((middleware) => {
      enhancedDispatch = middleware(enhancedDispatch);
    });

    return enhancedDispatch;
  };
}

// Logger middleware
const logger = (dispatch) => (action) => {
  console.log('Action:', action);
  const result = dispatch(action);
  console.log('State updated');
  return result;
};

// Thunk middleware
const thunk = (dispatch) => (action) => {
  if (typeof action === 'function') {
    return action(dispatch);
  }
  return dispatch(action);
};

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY PATTERNS:
 * 1. Action type constants for consistency
 * 2. Action creators for encapsulation
 * 3. Reducer composition for large state
 * 4. Combined with Context for global state
 *
 * BEST PRACTICES:
 * - Keep reducers pure (no side effects)
 * - Use action creators for complex payloads
 * - Split large reducers into smaller ones
 * - Consider Immer for complex nested updates
 * - Handle async with custom dispatch patterns
 */
