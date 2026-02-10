/**
 * Main App Component - Enhanced with Enterprise Modules
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { AuthProvider } from './contexts/AuthContext';
import { enterpriseStore } from './store/enterpriseStore';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.tsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.tsx'));

// Enterprise modules
const ModernDashboard = lazy(() => import('./pages/enterprise/ModernDashboard'));

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Provider store={enterpriseStore}>
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                
                {/* Original Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Enterprise Module Routes */}
                <Route 
                  path="/enterprise/dashboard" 
                  element={
                    <ProtectedRoute>
                      <ModernDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/enterprise/crm" 
                  element={
                    <ProtectedRoute>
                      <ModernDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/enterprise/employees" 
                  element={
                    <ProtectedRoute>
                      <ModernDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* 404 and Catch-all */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
