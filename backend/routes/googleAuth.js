/**
 * Google OAuth 2.0 Authentication Routes
 * Handles Google Sign-In flow with JWT token generation
 */

const express = require('express');
const { verifyGoogleToken, getGoogleAuthURL, exchangeCodeForTokens } = require('../config/googleAuth');
const { generateTokenPair, getCookieOptions } = require('../utils/jwt');
const User = require('../models/User');

const router = express.Router();

/**
 * @route   POST /auth/google/signin
 * @desc    Authenticate user with Google ID token (Frontend flow)
 * @access  Public
 * @method  Frontend sends Google ID token directly
 */
router.post('/google/signin', async (req, res) => {
  try {
    console.log('🚀 Google Sign-In attempt started');
    
    const { idToken } = req.body;
    
    // Validate input
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required'
      });
    }
    
    // Verify Google token
    const verificationResult = await verifyGoogleToken(idToken);
    
    if (!verificationResult.success) {
      return res.status(401).json({
        success: false,
        message: verificationResult.error
      });
    }
    
    const googleUser = verificationResult.user;
    console.log('✅ Google user verified:', googleUser.email);
    
    // Find or create user in database
    const user = await User.findOrCreateGoogleUser(googleUser);
    
    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }
    
    // Update login information
    user.updateLoginInfo();
    
    // Generate JWT tokens
    const tokens = generateTokenPair(user);
    
    user.addRefreshToken(tokens.refreshToken);
    await user.save();
    
    console.log('🎉 Google authentication successful for:', user.email);
    
    // Set HTTP-only cookies for both tokens (more secure)
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = getCookieOptions(isProduction);
    
    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);
    
    // Set access token as HTTP-only cookie with shorter expiry
    const accessTokenCookieOptions = { ...cookieOptions };
    accessTokenCookieOptions.maxAge = 15 * 60 * 1000; // 15 minutes
    res.cookie('accessToken', tokens.accessToken, accessTokenCookieOptions);
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Successfully logged in with Google account',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          authProvider: user.authProvider,
          emailVerified: user.emailVerified,
          permissions: user.permissions
        },
        accessToken: tokens.accessToken,
        // Note: refreshToken is set as HTTP-only cookie for security
        tokenType: 'Bearer',
        expiresIn: '15m'
      }
    });
    
  } catch (error) {
    console.error('❌ Google authentication error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during Google authentication',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /auth/google
 * @desc    Initiate Google OAuth flow (Redirect method)
 * @access  Public
 * @method  Redirects user to Google consent screen
 */
router.get('/google', (req, res) => {
  try {
    console.log('🔄 Initiating Google OAuth redirect flow');
    
    const authUrl = getGoogleAuthURL();
    
    // Redirect user to Google OAuth consent screen
    res.redirect(authUrl);
    
  } catch (error) {
    console.error('❌ Google OAuth initiation error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to initiate Google authentication'
    });
  }
});

/**
 * @route   GET /auth/google/callback
 * @desc    Handle Google OAuth callback (Redirect method)
 * @access  Public
 * @method  Processes authorization code from Google
 */
router.get('/google/callback', async (req, res) => {
  try {
    console.log('🔄 Processing Google OAuth callback');
    
    const { code, error, state } = req.query;
    
    // Handle OAuth errors
    if (error) {
      console.error('❌ Google OAuth error:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_denied`);
    }
    
    // Validate authorization code
    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
    }
    
    // Exchange code for tokens and user info
    const tokenResult = await exchangeCodeForTokens(code);
    
    if (!tokenResult.success) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=token_exchange_failed`);
    }
    
    const googleUser = {
      googleId: tokenResult.user.id,
      email: tokenResult.user.email,
      name: tokenResult.user.name,
      profilePicture: tokenResult.user.picture,
      emailVerified: tokenResult.user.verified_email
    };
    
    // Find or create user
    const user = await User.findOrCreateGoogleUser(googleUser);
    
    if (!user.isActive) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=account_deactivated`);
    }
    
    // Update login info
    user.updateLoginInfo();
    
    // Generate tokens
    const tokens = generateTokenPair(user);
    user.addRefreshToken(tokens.refreshToken);
    await user.save();
    
    console.log('🎉 Google OAuth callback successful for:', user.email);
    
    // Set refresh token cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', tokens.refreshToken, getCookieOptions(isProduction));
    
    // Redirect to frontend with access token
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/success?token=${tokens.accessToken}`;
    res.redirect(redirectUrl);
    
  } catch (error) {
    console.error('❌ Google OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_error`);
  }
});

/**
 * @route   POST /auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 * @method  Uses refresh token from cookie or body
 */
router.post('/refresh', async (req, res) => {
  try {
    // Get refresh token from cookie or request body
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    
    // Verify refresh token
    const { verifyRefreshToken } = require('../utils/jwt');
    const verificationResult = verifyRefreshToken(refreshToken);
    
    if (!verificationResult.success) {
      return res.status(401).json({
        success: false,
        message: verificationResult.error
      });
    }
    
    // Find user and validate refresh token
    const user = await User.findById(verificationResult.payload.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    
    // Check if refresh token exists in user's token list
    const tokenExists = user.refreshTokens.some(
      tokenObj => tokenObj.token === refreshToken && tokenObj.expiresAt > new Date()
    );
    
    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found or expired'
      });
    }
    
    // Generate new access token
    const { generateAccessToken } = require('../utils/jwt');
    const newAccessToken = generateAccessToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });
    
    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        tokenType: 'Bearer',
        expiresIn: '15m'
      }
    });
    
  } catch (error) {
    console.error('❌ Token refresh error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh'
    });
  }
});

/**
 * @route   POST /auth/logout
 * @desc    Logout user and invalidate refresh token
 * @access  Private
 */
router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if (refreshToken) {
      // Find user and remove refresh token
      const { verifyRefreshToken } = require('../utils/jwt');
      const verificationResult = verifyRefreshToken(refreshToken);
      
      if (verificationResult.success) {
        const user = await User.findById(verificationResult.payload.userId);
        if (user) {
          user.removeRefreshToken(refreshToken);
          await user.save();
        }
      }
    }
    
    // Clear both access and refresh token cookies
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    
    res.json({
      success: true,
      message: 'Successfully logged out'
    });
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
});

module.exports = router;