const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const makeToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// POST /api/auth/register
router.post('/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { name, email, password, phone } = req.body;
    try {
      if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });
      const user = await User.create({ name, email, password, phone: phone || '' });
      res.status(201).json({
        success: true,
        token: makeToken(user._id),
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

// POST /api/auth/login
router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user || !(await user.matchPassword(password)))
        return res.status(401).json({ message: 'Invalid email or password' });

      res.json({
        success: true,
        token: makeToken(user._id),
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } });
});

// PUT /api/auth/profile
router.put('/profile', protect,
  [body('name').optional().trim().isLength({ min: 2 })],
  async (req, res) => {
    try {
      const { name, phone, address } = req.body;
      const user = await User.findById(req.user._id);
      if (name)    user.name    = name;
      if (phone)   user.phone   = phone;
      if (address) user.address = address;
      if (req.body.password) {
        if (req.body.password.length < 6) return res.status(400).json({ message: 'Password too short' });
        user.password = req.body.password;
      }
      await user.save();
      res.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
      res.status(500).json({ message: 'Server error updating profile' });
    }
  }
);

module.exports = router;
