# Code Examples - Authentication Patterns

## 🎯 Common Use Cases

### 1. Basic Login Form

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await login({ email, password });
      
      if (result.success) {
        // Wait for state to propagate
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Navigate based on role
        if (result.user.role === 'Admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
```

### 2. Protected Route with Role Check

```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

function ProtectedRoute({ children, requiredRoles = [] }) {
  const { isAuthenticated, isLoading, user, hasAnyRole } = useAuth();

  // Show loading while checking auth
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirements
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <p>Required roles: {requiredRoles.join(', ')}</p>
        <p>Your role: {user?.role}</p>
      </div>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
}

export default ProtectedRoute;
```

### 3. Conditional Navigation Button

```javascript
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function NavigationButton({ to, label, requiredAuth = true }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (requiredAuth && !isAuthenticated) {
      toast.error('Please login to access this feature');
      navigate('/login');
      return;
    }

    navigate(to);
  };

  return (
    <button onClick={handleClick}>
      {label}
    </button>
  );
}

// Usage
<NavigationButton 
  to="/employees" 
  label="Manage Employees" 
  requiredAuth={true}
/>
```

### 4. Auto-Redirect After Login

```javascript
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to access
  const from = location.state?.from || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = async (credentials) => {
    const result = await login(credentials);
    
    if (result.success) {
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect to intended page or dashboard
      navigate(from, { replace: true });
    }
  };

  return (
    <div>
      {/* Login form */}
    </div>
  );
}
```

### 5. Role-Based Component Rendering

```javascript
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const { user, hasRole, hasAnyRole } = useAuth();

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>

      {/* Show only to Admin */}
      {hasRole('Admin') && (
        <div className="admin-panel">
          <h2>Admin Panel</h2>
          <button>Manage Users</button>
          <button>System Settings</button>
        </div>
      )}

      {/* Show to Admin or HR */}
      {hasAnyRole(['Admin', 'HR']) && (
        <div className="hr-panel">
          <h2>HR Tools</h2>
          <button>Manage Employees</button>
          <button>View Reports</button>
        </div>
      )}

      {/* Show to everyone */}
      <div className="user-panel">
        <h2>My Profile</h2>
        <button>Edit Profile</button>
        <button>Change Password</button>
      </div>
    </div>
  );
}
```

### 6. Permission-Based Actions

```javascript
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function EmployeeList() {
  const { hasPermission, hasAnyPermission } = useAuth();

  const handleEdit = (employee) => {
    if (!hasPermission('employee:write')) {
      toast.error('You don\'t have permission to edit employees');
      return;
    }

    // Proceed with edit
    console.log('Editing employee:', employee);
  };

  const handleDelete = (employee) => {
    if (!hasPermission('employee:delete')) {
      toast.error('You don\'t have permission to delete employees');
      return;
    }

    // Proceed with delete
    console.log('Deleting employee:', employee);
  };

  return (
    <div>
      <h2>Employees</h2>
      {/* Employee list */}
      
      {/* Show buttons based on permissions */}
      {hasAnyPermission(['employee:write', 'employee:delete']) && (
        <div className="actions">
          {hasPermission('employee:write') && (
            <button onClick={() => handleEdit(employee)}>Edit</button>
          )}
          {hasPermission('employee:delete') && (
            <button onClick={() => handleDelete(employee)}>Delete</button>
          )}
        </div>
      )}
    </div>
  );
}
```

### 7. Logout with Confirmation

```javascript
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    
    if (!confirmed) return;

    try {
      await logout();
      
      // Navigate to login page
      navigate('/login', { replace: true });
      
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}
```

### 8. Token Refresh Handler

```javascript
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function TokenRefreshHandler() {
  const { refreshToken, logout } = useAuth();

  useEffect(() => {
    // Check token expiry every 5 minutes
    const interval = setInterval(async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) return;

      try {
        // Decode JWT to check expiry
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiry = expiryTime - currentTime;

        // Refresh if token expires in less than 5 minutes
        if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
          console.log('Refreshing token...');
          await refreshToken();
        }

        // Logout if token already expired
        if (timeUntilExpiry <= 0) {
          console.log('Token expired, logging out...');
          await logout();
        }
      } catch (error) {
        console.error('Token refresh error:', error);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [refreshToken, logout]);

  return null; // This component doesn't render anything
}

// Add to App.js
function App() {
  return (
    <AuthProvider>
      <TokenRefreshHandler />
      {/* Rest of app */}
    </AuthProvider>
  );
}
```

### 9. Remember Me Functionality

```javascript
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function LoginWithRememberMe() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();

  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Save or remove email based on remember me
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    const result = await login({ email, password });
    
    if (result.success) {
      await new Promise(resolve => setTimeout(resolve, 100));
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <label>
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        Remember me
      </label>
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### 10. Session Timeout Warning

```javascript
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function SessionTimeoutWarning() {
  const { logout, refreshToken } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

  useEffect(() => {
    let timeoutId;
    let warningId;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      setShowWarning(false);

      // Show warning 5 minutes before timeout
      warningId = setTimeout(() => {
        setShowWarning(true);
        toast('Your session will expire in 5 minutes', {
          icon: '⏰',
          duration: 10000,
        });
      }, SESSION_TIMEOUT - WARNING_TIME);

      // Logout after timeout
      timeoutId = setTimeout(() => {
        logout();
        toast.error('Session expired. Please login again.');
      }, SESSION_TIMEOUT);
    };

    // Reset timer on user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Initial timer
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [logout]);

  const handleExtendSession = async () => {
    try {
      await refreshToken();
      setShowWarning(false);
      toast.success('Session extended');
    } catch (error) {
      toast.error('Failed to extend session');
    }
  };

  if (!showWarning) return null;

  return (
    <div className="session-warning">
      <p>Your session will expire soon. Do you want to continue?</p>
      <button onClick={handleExtendSession}>Extend Session</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 🔧 Utility Functions

### Check if Token is Expired

```javascript
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000;
    return Date.now() >= expiryTime;
  } catch (error) {
    return true;
  }
};

// Usage
const token = localStorage.getItem('accessToken');
if (isTokenExpired(token)) {
  console.log('Token expired, need to refresh');
}
```

### Decode JWT Token

```javascript
export const decodeToken = (token) => {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: payload.userId,
      role: payload.role,
      exp: payload.exp,
      iat: payload.iat,
    };
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

// Usage
const token = localStorage.getItem('accessToken');
const decoded = decodeToken(token);
console.log('User ID:', decoded?.userId);
console.log('Role:', decoded?.role);
```

### Get Time Until Token Expiry

```javascript
export const getTimeUntilExpiry = (token) => {
  if (!token) return 0;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000;
    const timeUntil = expiryTime - Date.now();
    return Math.max(0, timeUntil);
  } catch (error) {
    return 0;
  }
};

// Usage
const token = localStorage.getItem('accessToken');
const timeUntil = getTimeUntilExpiry(token);
const minutes = Math.floor(timeUntil / 60000);
console.log(`Token expires in ${minutes} minutes`);
```

## 🎨 Custom Hooks

### useRequireAuth Hook

```javascript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useRequireAuth = (redirectUrl = '/login') => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectUrl]);

  return { isAuthenticated, isLoading };
};

// Usage in component
function ProtectedPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return null;

  return <div>Protected content</div>;
}
```

### useRequireRole Hook

```javascript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useRequireRole = (requiredRoles = []) => {
  const { user, hasAnyRole, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && requiredRoles.length > 0) {
      if (!hasAnyRole(requiredRoles)) {
        toast.error('You don\'t have permission to access this page');
        navigate('/', { replace: true });
      }
    }
  }, [user, requiredRoles, hasAnyRole, isLoading, navigate]);

  return { hasRequiredRole: hasAnyRole(requiredRoles), isLoading };
};

// Usage in component
function AdminPage() {
  const { hasRequiredRole, isLoading } = useRequireRole(['Admin']);

  if (isLoading) return <LoadingSpinner />;
  if (!hasRequiredRole) return null;

  return <div>Admin content</div>;
}
```

---

**Best Practices:**
1. Always wait for state updates before navigation
2. Use `replace: true` to prevent back button issues
3. Check authentication state before protected actions
4. Handle loading states properly
5. Provide clear error messages
6. Implement token refresh before expiry
7. Clear sensitive data on logout
8. Use role/permission checks for UI elements
9. Implement session timeout warnings
10. Log security events for monitoring
