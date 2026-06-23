const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const userExists = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with that email or username' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Random avatar
    const randomId = Math.floor(Math.random() * 1000);
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${randomId}`;

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      avatar
    });

    res.status(201).json({
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        status: user.status,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await user.matchPassword(password))) {
      res.json({
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          status: user.status,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.json({ data: req.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update profile info
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;
      
      const updatedUser = await user.save();
      
      res.json({
        data: {
          _id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          bio: updatedUser.bio,
          status: updatedUser.status
        }
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get or search all users
// @route   GET /api/auth/users
// @access  Private
router.get('/users', protect, async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { username: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } }
          ]
        }
      : {};

    // Exclude logged in user
    const users = await User.find(keyword)
      .find({ _id: { $ne: req.user._id } })
      .select('-password');

    res.json({ data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
