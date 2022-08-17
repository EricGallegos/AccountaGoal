const mongoose = require('mongoose');
const moment = require('moment');

function toEndOfDay(date){
  return moment(date).endOf('day')
}

const GoalSchema = new mongoose.Schema({
  body: {
    type: String,
    required: true,
    trim: true,
  },
  repeating:{
    type: String,
    default: false,
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
  },
  dueDate:{
    type: Date,
    set: toEndOfDay,
    required: true,
  },
})

module.exports = mongoose.model('Goal', GoalSchema);
