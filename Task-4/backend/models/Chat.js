const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: ''
  },
  isGroupChat: {
    type: Boolean,
    default: false
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
