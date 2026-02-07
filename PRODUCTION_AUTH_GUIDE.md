# Production-Ready Google OAuth 2.0 Authentication System

## Overview

This is a comprehensive, production-ready authentication system built with Google OAuth 2.0, featuring role-based access control (RBAC), JWT tokens, and security best practices.

## Tech Stack

### Backend
- **Node.js + Express**: RESTful API server
- **MongoDB + Mongoose**: Database and ODM
- **JWT**: Access and refresh tokens
- **Google Auth Library**: OAuth 2.0 integration
- **Helmet**: Security headers
- **Rate Limiting**: Brute force protection

### Frontend
- **React (Vite)**: Modern UI framework
- **Tailwind CSS**: Utility-first styling
- **React Router**: Client-side routing
- **Framer Motion**: Smooth animations
- **React Hot Toast**: User notifications

## Features Implemented

### ✅ Core Authentication
- [x] Google OAuth 2.0 integration
- [x] JWT access + refresh tokens
- [x] HttpOnly cookies for security
- [x] Token expiration and refresh
- [x] Secure logout with Google session revocation

### ✅ Role-Based Access Control (RBAC)
- [x] Three roles: Admin, HR, Viewer
- [x] Permission-based authorization
- [x] Protected routes by role
- [x] Backend middleware for role checking

### ✅ User Experience
- [x] Google profile pictures in navbar
- [x] Auto-redirect based on user role
- [x] Separate admin and user dashboards
- [x] Loading states and error handling
- [x] Toast notifications

### ✅ Security Best Practices
- [x] HttpOnly cookies for JWT tokens
- [x] CSRF protection
- [x] XSS prevention
- [x] Rate limiting
- [x] Environment variable configuration
- [x] Secure token storage

## Project Structure

```
Employee register app/
├── backend/
│   ├── config/
│   │   ├── googleAuth.js          # Google OAuth configuration
│   │   └── database-simple.js     # MongoDB setup
│   ├── middleware/
│   │   └── auth.js               # Authentication & authorization middleware
│   ├── models/
│   │   └── User.js               # User schema with RBAC
│   ├── routes/
│   │   └── googleAuth.js         # Google OAuth endpoints
│   ├── utils/
│   │   └── jwt.js               # JWT token utilities
│   └── server.js                # Express server setup
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── GoogleSignIn.js    # Google Sign-In component
│   │   │   │   ├── ProtectedRoute.js   # Route protection
│   │   │   │   └── RoleRoute.js       # Role-based routes
│   │   │   └── layout/
│   │   │       └── Layout.js          # Navbar with profile pictures
│   │   ├── contexts/
│   │   │   └── AuthContext.js       # Global auth state
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboard.js # Admin-only dashboard
│   │   │   ├── user/
│   │   │   │   └── UserDashboard.js  # User dashboard
│   │   │   └── auth/
│   │   │       └── Login.js           # Login with Google
│   │   └── App.js                  # Route configuration
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/google/signin` - Google Sign-In (frontend flow)
- `GET /api/auth/google` - Initiate Google OAuth (redirect flow)
- `GET /api/auth/google/callback` - Handle Google OAuth callback
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and invalidate tokens

### Protected Routes (Examples)
- `GET /api/auth/me` - Get current user info
- `GET /api/users` - List users (Admin only)
- `GET /api/employees` - List employees (Admin/HR/Viewer)

## Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (optional for OAuth),
  googleId: String (optional, sparse),
  profilePicture: String,
  authProvider: String (enum: ['local', 'google']),
  emailVerified: Boolean,
  role: String (enum: ['Admin', 'HR', 'Viewer'], default: 'Viewer'),
  isActive: Boolean (default: true),
  lastLogin: Date,
  refreshTokens: [{ token: String, expiresAt: Date }],
  permissions: [String] (virtual, based on role)
}
```

## Role Permissions

### Admin
- `users:*` - Full user management
- `employees:*` - Full employee management
- `departments:*` - Full department management
- `jobTitles:*` - Full job title management
- `attendance:*` - Full attendance management
- `dashboard:read` - View dashboard
- `notifications:read` - View notifications

### HR
- `employees:create,read,update` - Employee management (no delete)
- `departments:read` - View departments
- `jobTitles:read` - View job titles
- `attendance:*` - Full attendance management
- `dashboard:read` - View dashboard
- `notifications:read` - View notifications

### Viewer
- `employees:read` - View employees only
- `departments:read` - View departments
- `jobTitles:read` - View job titles
- `attendance:read` - View attendance only
- `dashboard:read` - View dashboard
- `notifications:read` - View notifications

## Setup Instructions

### 1. Google Cloud Console Setup

1. **Create a Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
   - Also enable "Google Identity Toolkit API"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Select "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - Add authorized redirect URIs:
     - `http://localhost:3000/auth/callback`
     - `https://yourdomain.com/auth/callback`

4. **Get Credentials**
   - Note down the **Client ID** and **Client Secret**

### 2. Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables**
   Create `.env` file:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/employee_management

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_make_it_long_and_random
   JWT_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

   # CORS Configuration
   FRONTEND_URL=http://localhost:3000

   # Session Configuration
   SESSION_SECRET=your_session_secret_key_here_make_it_long_and_random
   ```

3. **Start MongoDB**
   ```bash
   mongod
   ```

4. **Start Backend Server**
   ```bash
   npm run dev
   ```

### 3. Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Variables**
   Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

3. **Start Frontend Server**
   ```bash
   npm start
   ```

## Usage Flow

### 1. User Login
1. User clicks "Continue with Google"
2. Google OAuth popup appears
3. User authenticates with Google
4. Google returns ID token
5. Frontend sends token to backend
6. Backend verifies token with Google
7. Backend creates/updates user in database
8. Backend generates JWT tokens
9. Backend sets HttpOnly cookies
10. Frontend receives user data
11. Auto-redirect based on role:
    - Admin → `/admin/dashboard`
    - HR/Viewer → `/user/dashboard`

### 2. Protected Route Access
1. User tries to access protected route
2. `ProtectedRoute` component checks authentication
3. `RoleRoute` component checks role permissions
4. If authorized, route renders
5. If not, redirects to appropriate page

### 3. Token Refresh
1. Access token expires (15 minutes)
2. Frontend automatically requests refresh
3. Backend validates refresh token
4. Backend issues new access token
5. User session continues seamlessly

### 4. Logout
1. User clicks logout
2. Frontend calls logout API
3. Backend invalidates refresh token
4. Frontend clears local storage
5. Frontend revokes Google session
6. Redirect to login page

## Security Features

### 1. Token Security
- **HttpOnly Cookies**: Prevents XSS attacks
- **Secure Flag**: HTTPS only in production
- **SameSite**: CSRF protection
- **Short Access Token Life**: 15 minutes
- **Refresh Token Rotation**: Prevents token reuse

### 2. Google OAuth Security
- **State Parameter**: CSRF protection
- **Token Verification**: Server-side validation
- **Client ID Validation**: Ensures correct app

### 3. Rate Limiting
- **Global Rate Limit**: 100 requests per 15 minutes
- **Auth Rate Limit**: Additional protection for auth endpoints

### 4. Input Validation
- **Email Validation**: Proper format checking
- **Role Validation**: Enum-based role checking
- **Token Validation**: JWT signature and expiry

## Testing

### 1. Create Test Users
```javascript
// Admin user
{
  email: "admin@example.com",
  role: "Admin"
}

// HR user
{
  email: "hr@example.com", 
  role: "HR"
}

// Viewer user
{
  email: "viewer@example.com",
  role: "Viewer"
}
```

### 2. Test Role-Based Access
1. Login as each role
2. Verify correct dashboard loads
3. Try accessing other role's routes
4. Verify access denied redirects

### 3. Test Security Features
1. Test XSS protection
2. Test CSRF protection
3. Test token expiration
4. Test refresh token flow
5. Test logout functionality

## Production Deployment

### 1. Environment Variables
```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
GOOGLE_REDIRECT_URI=https://yourapi.com/api/auth/google/callback
```

### 2. HTTPS Configuration
- Enable HTTPS on both frontend and backend
- Update Google OAuth redirect URIs
- Ensure secure cookie flags work

### 3. Database Security
- Use MongoDB Atlas or secured MongoDB instance
- Enable authentication
- Configure firewall rules

### 4. Monitoring
- Set up logging
- Monitor authentication failures
- Track token refresh patterns
- Alert on suspicious activity

## Troubleshooting

### Common Issues

1. **Google OAuth Error: "redirect_uri_mismatch"**
   - Check redirect URI in Google Console
   - Ensure it matches exactly (including protocol)

2. **CORS Errors**
   - Check FRONTEND_URL environment variable
   - Ensure it matches the frontend domain

3. **Token Not Working**
   - Check JWT secrets match between frontend/backend
   - Verify token expiration times

4. **Profile Pictures Not Loading**
   - Check Google API is enabled
   - Verify user has profile picture

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=auth:*
```

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Test all authentication flows

## License

MIT License - feel free to use this in your projects!

---

## Final UX Flow Summary

1. **Landing Page**: User sees login page with "Continue with Google" button
2. **Authentication**: Google OAuth popup → User authenticates → Tokens generated
3. **Auto-Redirect**: Based on role, user lands on appropriate dashboard
4. **Dashboard Experience**: 
   - Admin: System overview, user management, analytics
   - HR: Employee management, attendance, team oversight
   - Viewer: Limited view, personal information, attendance
5. **Navigation**: Role-based menu items, profile pictures in navbar
6. **Session Management**: Automatic token refresh, secure logout
7. **Security**: HttpOnly cookies, CSRF protection, role-based access

This system provides a complete, production-ready authentication solution with Google OAuth 2.0 and comprehensive security features.
