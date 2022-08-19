const Goals  = require('../models/Goal');
const moment = require('moment')

module.exports = {
  // @desc     Show add goals page
  // @route    GET /goals/add
  getAddGoals: (req, res) => {
    res.render('goals/add')
  },

  // @desc     Process add goal form
  // @route    POST /goals
  postGoal: async (req, res) => {
    try {
      req.body.user = req.user.id;
      temp = await Goals.create(req.body);
      if(req.body.repeating == 'true'){
        await Goals.create({
          user: req.body.user,
          body: req.body.body,
          archived: true,
          creatorID: temp._id,
          dueDate: req.body.dueDate,
        })
      }
      res.redirect('/dashboard');
    }
    catch (e) {
      console.error(e);
      res.render('error/500');
    }
  },

  // @desc     Show edit Goals page
  // @route    GET /goals/edit/<goal.id>
  getEditGoals: async (req, res) => {
    try {
      let goal = await Goals.findOne({_id: req.params.id}).lean();
      if(!goal){
        return res.render('error/404');
      }
      if(goal.user != req.user.id){
        res.redirect('/dashboard');
      } else{
         if(goal.archived == true){
           goal = await Goals.findOne({_id: goal.creatorID}).lean();
         }
        res.render('goals/edit', {
          goal,
        })
      }
    }
    catch (e) {
      console.error(e);
      return res.render('error/500');
    }
  },

  // @desc     Process edit form
  // @route    PUT /goals/<goal.id>
  putGoal: async (req, res) => {
    try {
      let goal = await Goals.findById(req.params.id).lean();
      if(!goal){
        return res.render('error/404');
      }
      if(goal.user != req.user.id){
        res.redirect('/dashboard');
      }
      else{
        const now = new Date();
        goal = await Goals.findOneAndUpdate({ _id: req.params.id }, req.body, {
          runValidators: true,
        });

        if ( req.body.repeating == 'true' && goal.startDate.getTime() < now.getTime()){
          // If goal is keeping its daily status
          if( goal.repeating == 'true'){
          goal = await Goals.findOneAndUpdate({
              creatorID: goal._id,
              archived: true,
              startDate: moment(now).startOf('day'),
            }, {
              body: req.body.body,
              dueDate: req.body.dueDate,
              repeating: 'false',
            }, {
              new: true,
              runValidators: true,
            })
            console.log(goal);
          }
          // If goal is changing from one day to repeating
          else{
            await Goals.create({
              user: req.user.id,
              body: req.body.body,
              archived: true,
              creatorID: goal._id,
              dueDate: req.body.dueDate,
            })
          }
        }
        // If goal is changing from repeating to one day
        if ( req.body.repeating == 'false' && goal.repeating == 'true'
             && goal.startDate.getTime() < now.getTime() ){
          await Goals.findOneAndDelete({
            creatorID: goal._id,
            startDate: moment(now).startOf('day'),
          })
        }

        res.redirect('/dashboard')
      }
    }
    catch (e) {
      console.error(e);
      return res.render('error/500');
    }
  },

  // @desc     Show all Goals
  // @route    GET /goals
  redirectDashboard: async (req, res) => {
    try {
      res.redirect('/dashboard');
    }
    catch (e) {
        console.error(e);
        res.render('error/500');
    }
  },

  // @desc     Toggle Complete Status on Goals
  // @route    PUT /goals/:id
  toggleComplete: async(req, res) =>{
    try {
      let goal = await Goals.findById(req.params.id).lean();
      if(!goal){
        return res.render('error/404');
      }
      if(goal.user != req.user.id){
        res.redirect('/dashboard');
      } else{
        goal = await Goals.findOneAndUpdate({ _id: req.params.id }, {
          $set:{
            status: "complete",
            completedOn: new Date(),
          },
        });

        res.redirect('/dashboard')
      }
    }
    catch (e) {
      console.error(e);
      return res.render('error/500');
    }
  },

  // @desc     Toggle Incomplete Status on Goals
  // @route    PUT /goals/:id
  toggleIncomplete: async(req, res) =>{
    try {
      let goal = await Goals.findById(req.params.id).lean();
      if(!goal){
        return res.render('error/404');
      }
      if(goal.user != req.user.id){
        res.redirect('/dashboard');
      } else{
        goal = await Goals.findOneAndUpdate({ _id: req.params.id }, {
          $set:{
            status: "incomplete",
            completedOn: null,
          },
        });

        res.redirect('/dashboard')
      }
    }
    catch (e) {
      console.error(e);
      return res.render('error/500');
    }
  },

  // @desc     Delete Goal
  // @route    DELETE /goals/<goal.id>
  deleteGoal: async (req, res) => {
    try {
      const target = await Goals.findOne( { _id: req.params.id } )
      await Goals.deleteOne( { _id: req.params.id } );
      if(target.archived == true ){
        await Goals.deleteOne( { _id: target.creatorID })
      }
      res.redirect('/dashboard')
    }
    catch (e) {
        console.error(e);
        return res.render('error/500')
    }
  },
}
