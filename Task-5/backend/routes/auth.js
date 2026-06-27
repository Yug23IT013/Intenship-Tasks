const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Notification = require('../models/Notification');
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

    // Random avatar & cover
    const seed = Math.floor(Math.random() * 1000);
    const avatar = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`;
    const coverImage = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=300&fit=crop`;

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      avatar,
      coverImage
    });

    res.status(201).json({
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        coverImage: user.coverImage,
        bio: user.bio,
        followersCount: 0,
        followingCount: 0,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Login user
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
          coverImage: user.coverImage,
          bio: user.bio,
          followersCount: user.followers.length,
          followingCount: user.following.length,
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

// @desc    Get me
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;
      user.coverImage = req.body.coverImage !== undefined ? req.body.coverImage : user.coverImage;

      const updated = await user.save();
      res.json({
        data: {
          _id: updated._id,
          username: updated.username,
          email: updated.email,
          avatar: updated.avatar,
          coverImage: updated.coverImage,
          bio: updated.bio,
          followersCount: updated.followers.length,
          followingCount: updated.following.length
        }
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get specific user details
// @route   GET /api/auth/user/:userId
// @access  Private
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isFollowing = user.followers.includes(req.user._id);
    res.json({
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        coverImage: user.coverImage,
        bio: user.bio,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        isFollowing
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Follow or Unfollow user
// @route   PUT /api/auth/user/follow/:userId
// @access  Private
router.put('/user/follow/:userId', protect, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });
    
    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const isFollowing = targetUser.followers.includes(req.user._id);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: targetUser._id } });
      await User.findByIdAndUpdate(targetUser._id, { $pull: { followers: req.user._id } });

      // Delete follow notification
      await Notification.deleteMany({
        recipient: targetUser._id,
        sender: req.user._id,
        type: 'follow'
      });

      res.json({ message: 'Unfollowed successfully', following: false });
    } else {
      // Follow
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: targetUser._id } });
      await User.findByIdAndUpdate(targetUser._id, { $addToSet: { followers: req.user._id } });

      // Create follow notification
      await Notification.create({
        recipient: targetUser._id,
        sender: req.user._id,
        type: 'follow'
      });

      res.json({ message: 'Followed successfully', following: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Search users or get recommendations
// @route   GET /api/auth/search
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { username: { $regex: req.query.search, $options: 'i' } }
          ]
        }
      : {};

    const users = await User.find(keyword)
      .find({ _id: { $ne: req.user._id } })
      .select('-password')
      .limit(10);

    res.json({ data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
