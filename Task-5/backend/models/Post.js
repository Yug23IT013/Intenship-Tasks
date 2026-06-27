const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  mediaUrl: {
    type: String,
    default: ''
  },
  mediaType: {
    type: String,
    enum: ['', 'image', 'video'],
    default: ''
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

// Index for tags searching
postSchema.index({ tags: 1 });

module.exports = mongoose.model('Post', postSchema);
