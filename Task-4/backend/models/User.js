const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  bio: {
    type: String,
    default: 'Hey there! I am using LocalChat.'
  }
}, { timestamps: true });

// Check password matches
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
