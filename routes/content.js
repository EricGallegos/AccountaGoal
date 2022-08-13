const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');

const Content  = require('../models/Content');

// @desc     Show all content
// @route    GET /content
router.get('/', ensureAuth, async (req, res) => {
  try {
    const content = await Content.find({ status: 'public'})
      .populate('user')
      .sort({ createdAt: 'desc'})
      .lean();

      res.render('content/index' , {
        content,
      })


  } catch (e) {
      console.error(e);
      res.render('error/500');
  }
})

// @desc     Show add content page
// @route    GET /content/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('content/add')
})

// @desc     Show individual content page
// @route    GET /content/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let content = await Content.findById(req.params.id)
      .populate('user')
      .lean();

      if(!content){
          return res.render('error/404');
      }
      res.render('content/show', {
        content,
      })
  } catch (e) {
    console.error(e);
    res.render('error/404');
  }
})

// @desc     Show user's content
// @route    GET /content/user/:userID
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const content = await Content.find({
      status: 'public',
      user: req.params.userId,
    })
      .populate('user')
      .sort({ createdAt: 'desc'})
      .lean();

      res.render('content/index' , {
        content,
      })


  } catch (e) {
      console.error(e);
      res.render('error/500');
  }
})

// @desc     Process form
// @route    POST /content
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Content.create(req.body);
    res.redirect('/dashboard');
  } catch (e) {
    console.error(e);
    res.render('error/500');
  }
})


// @desc     Show edit content page
// @route    GET /content/edit/<content.id>
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const content = await Content.findOne({_id: req.params.id}).lean();
    if(!content){
      return res.render('error/404');
    }
    if(content.user != req.user.id){
      res.redirect('/content');
    } else{
      res.render('content/edit', {
        content,
      })
    }
  } catch (e) {
    console.error(e);
    return res.render('error/500');
  }
})

// @desc     Process add form
// @route    PUT /content/<content.id>
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let content = await Content.findById(req.params.id).lean();
    if(!content){
      return res.render('error/404');
    }
    if(content.user != req.user.id){
      res.redirect('/content');
    } else{
      content = await Content.findOneAndUpdate({ _id: req.params.id }, req.body, {
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

// @desc     Delete Content
// @route    DELETE /content/<content.id>
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    await Content.deleteOne( { _id: req.params.id } );
    res.redirect('/dashboard')
  } catch (e) {
      console.error(e);
      return res.render('error/500')
  }
})


module.exports = router;
