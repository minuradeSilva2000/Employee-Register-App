import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Briefcase, Users, UserCircle, Mail, Lock, Eye, EyeOff, AlertCircle, Info } from 'lucide-react'

interface LoginPageProps {
  onLogin: () => void
}

// Declare google on window object
declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [googleConfigured, setGoogleConfigured] = useState(false)
  const navigate = useNavigate()

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => {
    // Check if Google Client ID is configured
    if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID.trim() !== '') {
      setGoogleConfigured(true)
      loadGoogleScript()
    }
  }, [])

  const loadGoogleScript = () => {
    // Load Google Sign-In script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initializeGoogleSignIn
    document.body.appendChild(script)
  }

  const initializeGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      })
    }
  }

  const handleGoogleCallback = (response: any) => {
    // Decode JWT token to get user info
    try {
      const userInfo = JSON.parse(atob(response.credential.split('.')[1]))
      console.log('Google Sign-In Success:', userInfo)
      
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify({
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        provider: 'google'
      }))
      
      // Call onLogin and navigate
      onLogin()
      navigate('/dashboard')
    } catch (error) {
      console.error('Google Sign-In Error:', error)
      setError('Failed to sign in with Google')
    }
  }

  const handleGoogleSignIn = () => {
    if (!googleConfigured) {
      alert('Google Sign-In is not configured.\n\nPlease add your Google Client ID to the .env file:\n\n1. Get Client ID from: https://console.cloud.google.com/\n2. Add to .env: VITE_GOOGLE_CLIENT_ID=your-client-id\n3. Restart the dev server\n\nSee GOOGLE_OAUTH_SETUP.md for detailed instructions.')
      return
    }

    if (window.google) {
      window.google.accounts.id.prompt()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Demo credentials
    if (email === 'admin@example.com' && password === 'admin123') {
      // Store user info
      localStorage.setItem('user', JSON.stringify({
        email: email,
        name: 'Admin User',
        provider: 'email'
      }))
      
      onLogin()
      navigate('/dashboard')
    } else {
      setError('Invalid credentials')
    }
  }

  const quickActions = [
    {
      icon: TrendingUp,
      title: 'Analytics',
      description: 'View reports and insights',
      color: 'bg-orange-500'
    },
    {
      icon: Briefcase,
      title: 'Management',
      description: 'Administrative controls and summaries',
      color: 'bg-purple-500'
    },
    {
      icon: Users,
      title: 'Department Management',
      description: 'Organize departments and job roles',
      color: 'bg-green-500'
    },
    {
      icon: UserCircle,
      title: 'Employee Management',
      description: 'Add, edit, and manage employee records',
      color: 'bg-blue-500'
    }
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Blue Panel with Quick Actions */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-700 p-12 flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Employee Management<br />System
          </h1>
          <p className="text-blue-100 text-lg">
            Streamline your HR operations with our comprehensive<br />
            employee management platform
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-6">Quick Actions</h2>
          <div className="space-y-4">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 hover:bg-opacity-20 transition-all cursor-pointer border border-white border-opacity-20"
              >
                <div className="flex items-center gap-4">
                  <div className={`${action.color} p-3 rounded-lg`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{action.title}</h3>
                    <p className="text-blue-100 text-sm">{action.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-blue-100 text-sm">
          © 2026 Employee Management System. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* User Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </a>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
            >
              Sign In
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>

            {/* Google Sign-In Notice */}
            {!googleConfigured && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <span className="font-medium">Google Sign-In Configuration Required</span>
                  <p className="mt-1 text-yellow-700">
                    Add VITE_GOOGLE_CLIENT_ID to .env file. 
                    <a href="#" onClick={(e) => { e.preventDefault(); alert('See GOOGLE_OAUTH_SETUP.md for instructions') }} className="underline ml-1">
                      Setup Guide
                    </a>
                  </p>
                </div>
              </div>
            )}

            {googleConfigured && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-800 font-medium">Google Sign-In is ready</span>
              </div>
            )}
          </form>

          {/* Demo Credentials Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">Demo Credentials:</p>
            <div className="space-y-1">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Email:</span> admin@example.com
              </p>
              <p className="text-sm text-blue-700">
                <span className="font-medium">Password:</span> admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
