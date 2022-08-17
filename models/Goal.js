const mongoose = require('mongoose');
const moment = require('moment');

function toStartOfDay(date){
  return moment(date).startOf('day');
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
  dueDate: {
    type: Date,
    set: d => moment(d).endOf('day'),
  },
  startDate: {
    type: Date,
  }
})

GoalSchema.pre('save', function(){
  this.startDate = moment(this.dueDate).startOf('day');
})

module.exports = mongoose.model('Goal', GoalSchema);
