const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { chatId, content, fileUrl, fileType, fileName } = req.body;

    if (!chatId || (!content && !fileUrl)) {
      return res.status(400).json({ message: 'Invalid message data' });
    }

    const newMessage = {
      sender: req.user._id,
      content: content || '',
      chat: chatId,
      fileUrl: fileUrl || '',
      fileType: fileType || '',
      fileName: fileName || ''
    };

    let message = await Message.create(newMessage);

    message = await message.populate('sender', 'username email avatar status');
    message = await message.populate('chat');
    message = await User.populate(message, {
      path: 'chat.members',
      select: 'username email avatar status'
    });

    // Update latest message in Chat
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message._id
    });

    res.status(201).json({ data: message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all messages for a chat room
// @route   GET /api/messages/:chatId
// @access  Private
router.get('/:chatId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'username email avatar status')
      .populate('chat');

    res.json({ data: messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
