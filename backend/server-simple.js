/**
 * Simple Server with In-Memory Database
 * For testing without MongoDB
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory database
const users = [];
let userId = 1;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

// Helper functions
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

// Routes

// POST /login - Simple login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // For demo, accept any email/password and create user if not exists
    let user = users.find(u => u.email === email);
    
    if (!user) {
      // Create new user
      user = {
        id: userId++,
        email,
        name: email.split('@')[0], // Use email prefix as name
        role: email.includes('admin') ? 'Admin' : 'User',
        createdAt: new Date()
      };
      users.push(user);
    }

    // Generate token
    const token = generateToken(user);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hour
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /logout - Logout with success message
app.post('/api/logout', (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie('token');
    
    res.json({
      success: true,
      message: 'Successfully logged out'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// GET /me - Get current user info
app.get('/api/me', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Users in memory: ${users.length}`);
  console.log(`🔑 JWT Secret: ${JWT_SECRET.substring(0, 10)}...`);
});

module.exports = app;
