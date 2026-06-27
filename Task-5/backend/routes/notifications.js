const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'username avatar')
      .populate({
        path: 'post',
        select: 'content mediaUrl'
      })
      .sort({ createdAt: -1 });

    res.json({ data: notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read
// @access  Private
router.put('/read', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
