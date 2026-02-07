const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(cors({origin: 'http://localhost:3000', credentials: true}));
app.use(cookieParser());
app.use(express.json());

// JWT Secret
const JWT_SECRET = 'your_jwt_secret_key_here';

// Routes
app.post('/api/login', (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Create user object (in real app, you'd validate against database)
    const user = {
      email,
      name: email.split('@')[0],
      role: email.includes('admin') ? 'Admin' : 'User'
    };

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // For development
      sameSite: 'lax',
      maxAge: 3600000 // 1 hour
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
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

app.get('/api/me', (req, res) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = {
      email: decoded.email,
      name: decoded.email.split('@')[0],
      role: decoded.role || 'User'
    };

    res.json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API Endpoints:`);
  console.log(`   POST /api/login - Login with email`);
  console.log(`   POST /api/logout - Logout with success message`);
  console.log(`   GET  /api/me - Get current user info`);
  console.log(`   GET  /api/health - Health check`);
});

module.exports = app;
