/**
 * Enterprise Redux Store Configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './slices/dashboardSlice';
import crmReducer from './slices/crmSlice';
import employeeReducer from './slices/employeeSlice';
import uiReducer from './slices/uiSlice';

export const enterpriseStore = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    crm: crmReducer,
    employee: employeeReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore Firebase Timestamp objects
        ignoredActions: ['dashboard/setMetrics', 'crm/setContacts', 'employee/setEmployees'],
        ignoredPaths: ['dashboard.activities', 'crm.contacts', 'employee.employees'],
      },
    }),
});

export type RootState = ReturnType<typeof enterpriseStore.getState>;
export type AppDispatch = typeof enterpriseStore.dispatch;
