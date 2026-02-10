/**
 * Login Page - Exact UI match to provided image
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/Login.module.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Attempt login
      const response = await login({ email, password });
      
      // Success - navigate to dashboard
      console.log('Login successful:', response);
      navigate('/dashboard');
    } catch (err: any) {
      // Handle login errors
      console.error('Login error:', err);
      
      // Extract error message
      const errorMessage = err?.message || 'Invalid credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Google login error:', err);
      const errorMessage = err?.message || 'Google authentication failed.';
      setError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* Left Panel - Blue Section */}
      <div className={styles.leftPanel}>
        <h1 className={styles.title}>
          Employee Management<br />System
        </h1>
        <p className={styles.subtitle}>
          Streamline your HR operations with our comprehensive<br />
          employee management platform
        </p>

        <h2 className={styles.quickActionsTitle}>Quick Actions</h2>
        
        <div className={styles.actionCards}>
          <div className={styles.actionCard}>
            <div className={`${styles.iconWrapper} ${styles.iconOrange}`}>
              📊
            </div>
            <div className={styles.actionContent}>
              <h3>Analytics</h3>
              <p>View reports and insights</p>
            </div>
          </div>

          <div className={styles.actionCard}>
            <div className={`${styles.iconWrapper} ${styles.iconPurple}`}>
              💼
            </div>
            <div className={styles.actionContent}>
              <h3>Management</h3>
              <p>Administrative controls and summaries</p>
            </div>
          </div>

          <div className={styles.actionCard}>
            <div className={`${styles.iconWrapper} ${styles.iconGreen}`}>
              👥
            </div>
            <div className={styles.actionContent}>
              <h3>Department Management</h3>
              <p>Organize departments and job roles</p>
            </div>
          </div>

          <div className={styles.actionCard}>
            <div className={`${styles.iconWrapper} ${styles.iconBlue}`}>
              👤
            </div>
            <div className={styles.actionContent}>
              <h3>Employee Management</h3>
              <p>Add, edit, and manage employee records</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className={styles.rightPanel}>
        <div className={styles.loginCard}>
          <div className={styles.userIconWrapper}>
            <span className={styles.userIcon}>👥</span>
          </div>

          <h2 className={styles.welcomeTitle}>Welcome Back</h2>
          <p className={styles.welcomeSubtitle}>Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email Address</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>✉️</span>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className={styles.rememberRow}>
              <div className={styles.checkboxWrapper}>
                <input
                  type="checkbox"
                  id="remember"
                  className={styles.checkbox}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember" className={styles.checkboxLabel}>
                  Remember me
                </label>
              </div>
              <a href="#" className={styles.forgotLink}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className={styles.signInButton}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {error && (
              <div className={styles.errorMessage}>
                <span className={styles.errorIcon}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className={styles.divider}>Or continue with</div>

            <button
              type="button"
              className={styles.googleButton}
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
            >
              <svg className={styles.googleIcon} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
            </button>

            {import.meta.env.VITE_GOOGLE_CLIENT_ID ? null : (
              <div className={styles.googleInfo}>
                <span className={styles.infoIcon}>ℹ️</span>
                <div>
                  <strong>Setup Required</strong>
                  <p>To enable Google Sign-In, add your Google OAuth Client ID to the environment variables.</p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
