/**
 * LoginForm Component - FIXED: Better error messages, validation
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // FIX: Better validation
    if (!email || !email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);
    setSuccess(false);

    try {
      await login({ email: email.trim(), password });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err: any) {
      // FIX: Specific error messages based on error code
      console.error('Login error:', err);
      
      const errorCode = err.code || '';
      
      if (errorCode === 'auth/user-not-found') {
        setError('No account found with this email address');
      } else if (errorCode === 'auth/wrong-password') {
        setError('Incorrect password. Please try again');
      } else if (errorCode === 'auth/invalid-email') {
        setError('Invalid email address format');
      } else if (errorCode === 'auth/user-disabled') {
        setError('This account has been disabled');
      } else if (errorCode === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later');
      } else if (errorCode === 'auth/network-request-failed') {
        setError('Network error. Please check your connection');
      } else if (errorCode === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else {
        setError('Login failed. Please check your credentials and try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔥 Firebase Login</h2>
        <p style={styles.subtitle}>Enter your credentials to continue</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder="test@example.com"
              style={styles.input}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter password"
              style={styles.input}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {error && <div style={styles.error}>❌ {error}</div>}
          {success && <div style={styles.success}>✅ Login successful! Redirecting...</div>}

          <button 
            type="submit" 
            style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>Test Account:</p>
          <p style={styles.footerText}>Email: test@example.com</p>
          <p style={styles.footerText}>Password: Test@123</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '8px',
    textAlign: 'center' as const,
    color: '#333'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    textAlign: 'center' as const,
    marginBottom: '30px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  },
  input: {
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    outline: 'none'
  },
  button: {
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  error: {
    padding: '12px',
    background: '#fee',
    color: '#c33',
    borderRadius: '6px',
    fontSize: '14px',
    textAlign: 'center' as const
  },
  success: {
    padding: '12px',
    background: '#efe',
    color: '#3c3',
    borderRadius: '6px',
    fontSize: '14px',
    textAlign: 'center' as const
  },
  footer: {
    marginTop: '30px',
    padding: '20px',
    background: '#f9f9f9',
    borderRadius: '6px',
    textAlign: 'center' as const
  },
  footerText: {
    fontSize: '12px',
    color: '#666',
    margin: '4px 0'
  }
};

export default LoginForm;
