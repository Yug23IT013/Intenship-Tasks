const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Helper to extract hashtags from text content
const extractHashtags = (text) => {
  if (!text) return [];
  const matches = text.match(/#\w+/g);
  if (!matches) return [];
  // Strip the '#' and convert to lowercase
  return [...new Set(matches.map(tag => tag.slice(1).toLowerCase()))];
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { content, mediaUrl, mediaType } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const tags = extractHashtags(content);

    const post = await Post.create({
      user: req.user._id,
      content,
      mediaUrl: mediaUrl || '',
      mediaType: mediaUrl ? (mediaType || 'image') : '',
      tags
    });

    const populated = await post.populate('user', 'username avatar bio');
    res.status(201).json({ data: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get timeline posts (self + following)
// @route   GET /api/posts
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let filter = {};
    
    // If following anyone, fetch self posts + following posts. Else fetch all.
    if (user.following && user.following.length > 0) {
      filter = { user: { $in: [...user.following, req.user._id] } };
    }

    const posts = await Post.find(filter)
      .populate('user', 'username avatar bio')
      .sort({ createdAt: -1 });

    res.json({ data: posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Explore posts (filter by tag, keyword search, or global trending feed)
// @route   GET /api/posts/explore
// @access  Private
router.get('/explore', protect, async (req, res) => {
  try {
    let query = {};
    if (req.query.tag) {
      query.tags = req.query.tag.toLowerCase();
    } else if (req.query.search) {
      query.content = { $regex: req.query.search, $options: 'i' };
    }

    const posts = await Post.find(query)
      .populate('user', 'username avatar bio')
      .sort({ createdAt: -1 });

    res.json({ data: posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get posts of a specific user
// @route   GET /api/posts/user/:userId
// @access  Private
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate('user', 'username avatar bio')
      .sort({ createdAt: -1 });

    res.json({ data: posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Like / Unlike post
// @route   PUT /api/posts/like/:postId
// @access  Private
router.put('/like/:postId', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike
      await Post.findByIdAndUpdate(req.params.postId, { $pull: { likes: req.user._id } });
      
      // Delete notification
      await Notification.deleteMany({
        recipient: post.user,
        sender: req.user._id,
        type: 'like',
        post: post._id
      });

      res.json({ message: 'Unliked post', liked: false });
    } else {
      // Like
      await Post.findByIdAndUpdate(req.params.postId, { $addToSet: { likes: req.user._id } });

      // Create notification (if liking someone else's post)
      if (post.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.user,
          sender: req.user._id,
          type: 'like',
          post: post._id
        });
      }

      res.json({ message: 'Liked post', liked: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Comment on a post
// @route   POST /api/posts/comment/:postId
// @access  Private
router.post('/comment/:postId', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Comment content is required' });

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({
      post: req.params.postId,
      user: req.user._id,
      content
    });

    // Notify author
    if (post.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.user,
        sender: req.user._id,
        type: 'comment',
        post: post._id
      });
    }

    const populated = await comment.populate('user', 'username avatar');
    res.status(201).json({ data: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get comments for a post
// @route   GET /api/posts/comments/:postId
// @access  Private
router.get('/comments/:postId', protect, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });

    res.json({ data: comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get top trending tags
// @route   GET /api/posts/trending
// @access  Private
router.get('/trending', protect, async (req, res) => {
  try {
    const posts = await Post.find({});
    const tagsMap = {};
    
    posts.forEach(p => {
      if (p.tags) {
        p.tags.forEach(t => {
          tagsMap[t] = (tagsMap[t] || 0) + 1;
        });
      }
    });

    const trending = Object.entries(tagsMap)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    res.json({ data: trending });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
