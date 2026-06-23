const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @desc    Access or create a one-to-one chat
// @route   POST /api/chats
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId param not sent with request' });
    }

    // Find if chat already exists between these 2 users
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { members: { $elemMatch: { $eq: req.user._id } } },
        { members: { $elemMatch: { $eq: userId } } }
      ]
    })
      .populate('members', '-password')
      .populate('latestMessage');

    isChat = await User.populate(isChat, {
      path: 'latestMessage.sender',
      select: 'username email avatar status'
    });

    if (isChat.length > 0) {
      res.json({ data: isChat[0] });
    } else {
      // Create new chat
      const chatData = {
        name: 'sender',
        isGroupChat: false,
        members: [req.user._id, userId]
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findById(createdChat._id).populate('members', '-password');
      res.status(201).json({ data: fullChat });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all chats for the logged in user
// @route   GET /api/chats
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let chats = await Chat.find({ members: { $elemMatch: { $eq: req.user._id } } })
      .populate('members', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: 'latestMessage.sender',
      select: 'username email avatar status'
    });

    res.json({ data: chats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a group chat
// @route   POST /api/chats/group
// @access  Private
router.post('/group', protect, async (req, res) => {
  try {
    const { users, name } = req.body;

    if (!users || !name) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    const parsedUsers = JSON.parse(users);

    if (parsedUsers.length < 1) {
      return res.status(400).json({ message: 'At least 1 other user is required to create a group chat' });
    }

    // Add logged in user to group
    parsedUsers.push(req.user._id);

    const groupChat = await Chat.create({
      name: name,
      isGroupChat: true,
      members: parsedUsers,
      groupAdmin: req.user._id
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate('members', '-password')
      .populate('groupAdmin', '-password');

    res.status(201).json({ data: fullGroupChat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add member to group chat
// @route   PUT /api/chats/group/add
// @access  Private
router.put('/group/add', protect, async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { members: userId } },
      { new: true }
    )
      .populate('members', '-password')
      .populate('groupAdmin', '-password');

    if (!added) {
      res.status(404).json({ message: 'Chat not found' });
    } else {
      res.json({ data: added });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Remove member from group chat
// @route   PUT /api/chats/group/remove
// @access  Private
router.put('/group/remove', protect, async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { members: userId } },
      { new: true }
    )
      .populate('members', '-password')
      .populate('groupAdmin', '-password');

    if (!removed) {
      res.status(404).json({ message: 'Chat not found' });
    } else {
      // If group is empty, we can clean up or just leave it
      res.json({ data: removed });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
