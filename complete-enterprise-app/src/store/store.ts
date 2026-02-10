// ============================================
// REDUX STORE CONFIGURATION
// Centralized state management with TypeScript
// ============================================

import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import themeReducer from './slices/themeSlice'
import crmReducer from './slices/crmSlice'
import employeeReducer from './slices/employeeSlice'
import attendanceReducer from './slices/attendanceSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    crm: crmReducer,
    employee: employeeReducer,
    attendance: attendanceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['attendance/checkIn', 'attendance/checkOut'],
      },
    }),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
