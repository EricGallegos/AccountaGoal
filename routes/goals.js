const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');

const Goals  = require('../models/Goal');

// @desc     Show all Goals
// @route    GET /goals
router.get('/', ensureAuth, async (req, res) => {
  try {
    res.redirect('/dashboard');


  } catch (e) {
      console.error(e);
      res.render('error/500');
  }
})

// @desc     Toggle Complete Status on Goals
// @route    PUT /goals/:id
router.put('/toggleComplete/:id', ensureAuth, async(req, res) =>{
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
        },
      });

      res.redirect('/dashboard')
    }
  } catch (e) {
    console.error(e);
    return res.render('error/500');
  }
})

// @desc     Toggle Incomplete Status on Goals
// @route    PUT /goals/:id
router.put('/toggleIncomplete/:id', ensureAuth, async(req, res) =>{
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
        },
      });

      res.redirect('/dashboard')
    }
  } catch (e) {
    console.error(e);
    return res.render('error/500');
  }
})

// @desc     Show add goals page
// @route    GET /goals/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('goals/add')
})

// @desc     Show individual goal page
// @route    GET /goals/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let goal = await Goals.findById(req.params.id)
      .populate('user')
      .lean();

      if(!goal){
          return res.render('error/404');
      }
      res.render('goals/show', {
        goal,
      })
  } catch (e) {
    console.error(e);
    res.render('error/404');
  }
})


// @desc     Process form
// @route    POST /goals
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Goals.create(req.body);
    res.redirect('/dashboard');
  } catch (e) {
    console.error(e);
    res.render('error/500');
  }
})


// @desc     Show edit Goals page
// @route    GET /goals/edit/<goal.id>
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const goals = await Goals.findOne({_id: req.params.id}).lean();
    if(!goals){
      return res.render('error/404');
    }
    if(goals.user != req.user.id){
      res.redirect('/dashboard');
    } else{
      res.render('goals/edit', {
        goals,
      })
    }
  } catch (e) {
    console.error(e);
    return res.render('error/500');
  }
})

// @desc     Process edit form
// @route    PUT /goals/<goal.id>
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let goals = await Goals.findById(req.params.id).lean();
    if(!goals){
      return res.render('error/404');
    }
    if(goals.user != req.user.id){
      res.redirect('/dashboard');
    } else{
      goals = await Goals.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      });

      res.redirect('/dashboard')
    }
  } catch (e) {
    console.error(e);
    return res.render('error/500');
  }
})

// @desc     Delete Goal
// @route    DELETE /goals/<goal.id>
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    await Goals.deleteOne( { _id: req.params.id } );
    res.redirect('/dashboard')
  } catch (e) {
      console.error(e);
      return res.render('error/500')
  }
})


module.exports = router;
