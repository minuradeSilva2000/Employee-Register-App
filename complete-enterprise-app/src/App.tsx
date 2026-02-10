import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { restoreSession } from './store/slices/authSlice'
import EnhancedLoginPage from './pages/EnhancedLoginPage'
import Dashboard from './pages/Dashboard'
import CRMPage from './pages/CRMPage'
import EmployeesPage from './pages/EmployeesPage'
import AnalyticsPage from './pages/AnalyticsPage'
import AttendancePage from './pages/AttendancePage'
import AttendanceReportPage from './pages/AttendanceReportPage'

function App() {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  useEffect(() => {
    // Restore session on app load
    dispatch(restoreSession())
  }, [dispatch])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EnhancedLoginPage />} />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />} 
        />
        <Route 
          path="/crm" 
          element={isAuthenticated ? <CRMPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/employees" 
          element={isAuthenticated ? <EmployeesPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/analytics" 
          element={isAuthenticated ? <AnalyticsPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/attendance" 
          element={isAuthenticated ? <AttendancePage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/attendance/report" 
          element={isAuthenticated ? <AttendanceReportPage /> : <Navigate to="/" />} 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
