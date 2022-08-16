const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  body: {
    type: String,
    required: true,
    trim: true,
  },
  repeating:{
    type: String,
    required: true,
    default: 'once',
  },
  status: {
    type: String,
    default: 'incomplete',
    enum: ['incomplete', 'complete'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
})

module.exports = mongoose.model('Goal', GoalSchema);
