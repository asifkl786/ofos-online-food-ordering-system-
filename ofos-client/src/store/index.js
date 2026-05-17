import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

// Create store instance
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Export store as default as well
export default store;