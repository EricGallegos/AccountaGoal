const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth');

const Content  = require('../models/Content');

// @desc     Login / Landing page
// @route    GET /
router.get('/', ensureGuest, (req, res) => {
  res.render('login', {
    layout: 'login',
  });
})

// @desc     Dashboard
// @route    GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
  try {
    const content = await Content.find({ user: req.user.id }).lean()

    res.render('dashboard', {
      name: req.user.firstName,
      content,
    });
  } catch (e) {
    console.error(e);
    res.render('error/500');
  }
})

module.exports = router;
