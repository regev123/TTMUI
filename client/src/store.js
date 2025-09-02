import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';

/**
 * @module store
 * @desc    Configures and exports the Redux store for the application.
 *          Sets up the root reducer, middleware, and Redux DevTools integration.
 * @access  Public
 *
 * Configuration Details:
 *
 * rootReducer - Combines all the reducers from the application into one root reducer.
 * getDefaultMiddleware - Applies default middleware from Redux Toolkit to handle
 *                        common tasks like async actions and immutability checks.
 * devTools - Enables Redux DevTools in non-production environments for easier debugging.
 *
 * @returns {Object} - The configured Redux store instance.
 */
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
