const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth authentication
 * @access  Public
 */
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
      }
      
      // Generate JWT tokens
      const accessToken = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
        { expiresIn: '7d' }
      );

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Redirect to frontend with tokens
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?` +
        `accessToken=${accessToken}&` +
        `refreshToken=${refreshToken}&` +
        `user=${encodeURIComponent(JSON.stringify({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          authProvider: user.authProvider
        }))}`;

      res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_error`);
    }
  }
);

/**
 * @route   POST /api/auth/google/verify
 * @desc    Verify Google ID token (for frontend Google Sign-In)
 * @access  Public
 */
router.post('/google/verify', async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
    }

    // Verify the Google ID token
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId });
    
    if (user) {
      // User exists, update profile picture if changed
      if (user.profilePicture !== picture) {
        user.profilePicture = picture;
        await user.save();
      }
    } else {
      // Check if user exists with same email (link accounts)
      user = await User.findOne({ email });
      
      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        user.authProvider = 'google';
        user.profilePicture = picture;
        await user.save();
      } else {
        // Create new user
        user = new User({
          googleId,
          name,
          email,
          profilePicture: picture,
          authProvider: 'google',
          role: 'Viewer', // Default role for Google OAuth users
          isActive: true
        });
        
        await user.save();
      }
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
      { expiresIn: '7d' }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Google authentication successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          authProvider: user.authProvider,
          permissions: user.permissions || []
        }
      }
    });

  } catch (error) {
    console.error('Google token verification error:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid Google token'
    });
  }
});

module.exports = router;