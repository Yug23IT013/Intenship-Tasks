const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const generateAccessToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });
};

const sendRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }

  const { username, email, password, role } = req.body;

  try {
    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(409).json({
        success: false,
        message: `An account with this ${field} already exists.`,
      });
    }

    // Only allow 'user' role on self-registration (admin must be set manually or via seeding)
    const assignedRole = role === 'admin' ? 'user' : (role || 'user');

    const user = await User.create({ username, email, password, role: assignedRole });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Persist refresh token in DB
    user.refreshTokens.push(refreshToken);
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      accessToken,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }

  const { email, password } = req.body;

  try {
    // Explicitly select password and refreshTokens since they have select:false
    const user = await User.findOne({ email }).select('+password +refreshTokens');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Rotate refresh tokens — keep max 5 sessions per user
    user.refreshTokens.push(refreshToken);
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      accessToken,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

/**
 * POST /api/auth/refresh
 * Issues a new access token using a valid refresh token from cookie.
 */
const refresh = async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No refresh token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user || !user.isActive || !user.refreshTokens.includes(token)) {
      // Token reuse detected or user doesn't exist — invalidate all sessions
      if (user) {
        user.refreshTokens = [];
        await user.save({ validateBeforeSave: false });
      }
      res.clearCookie('refreshToken');
      return res.status(403).json({ success: false, message: 'Invalid refresh token. Please log in again.' });
    }

    // Rotate refresh token (token rotation for security)
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    user.refreshTokens.push(newRefreshToken);
    await user.save({ validateBeforeSave: false });

    const accessToken = generateAccessToken(user._id, user.role);
    sendRefreshTokenCookie(res, newRefreshToken);

    return res.status(200).json({
      success: true,
      accessToken,
      user: user.toSafeObject(),
    });
  } catch (error) {
    res.clearCookie('refreshToken');
    return res.status(403).json({ success: false, message: 'Refresh token expired or invalid.' });
  }
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id).select('+refreshTokens');
      if (user) {
        user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
        await user.save({ validateBeforeSave: false });
      }
    } catch (_) {
      // Token invalid/expired — still clear cookie
    }
  }

  res.clearCookie('refreshToken');
  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

/**
 * GET /api/auth/me — requires verifyToken middleware
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({ success: true, user: user.toSafeObject() });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { register, login, refresh, logout, getMe };
