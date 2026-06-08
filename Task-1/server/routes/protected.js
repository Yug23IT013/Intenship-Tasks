const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const User = require('../models/User');

const router = express.Router();

/**
 * GET /api/protected/dashboard
 * Accessible by any authenticated user (user or admin)
 */
router.get('/dashboard', verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: `Welcome to your dashboard, ${req.user.email}!`,
    data: {
      userId: req.user.id,
      role: req.user.role,
      accessedAt: new Date().toISOString(),
    },
  });
});

/**
 * GET /api/protected/admin
 * Admin only — returns list of all users
 */
router.get('/admin', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Admin panel data.',
      count: users.length,
      users: users.map((u) => u.toSafeObject()),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/**
 * PATCH /api/protected/admin/users/:id/role
 * Admin only — change a user's role
 */
router.patch('/admin/users/:id/role', verifyToken, requireRole('admin'), async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role. Must be "user" or "admin".' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.status(200).json({ success: true, message: 'Role updated.', user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/**
 * DELETE /api/protected/admin/users/:id
 * Admin only — deactivate a user
 */
router.delete('/admin/users/:id', verifyToken, requireRole('admin'), async (req, res) => {
  if (req.params.id === req.user.id.toString()) {
    return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
  }

  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.status(200).json({ success: true, message: 'User deactivated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
