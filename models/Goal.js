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
    default: 'false',
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
  },
  completedOn: {
    type: Date,
    default: null,
  },
  archived:{
    type: Boolean,
    default: false,
  },
  creatorID:{
    type: mongoose.Schema.Types.ObjectId,
  }
})

GoalSchema.pre('save', async function(){
  this.startDate = moment(this.dueDate).startOf('day');
  const now = new Date();
  })

module.exports = mongoose.model('Goal', GoalSchema);
