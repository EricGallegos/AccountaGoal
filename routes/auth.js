const express = require('express');
const controller = require('../controller/auth')
const passport = require('passport');
const router = express.Router();


router.get('/google', passport.authenticate('google', { scope: ['profile'] }))

router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/',
  }), controller.redirect)

router.get('/logout', controller.logout);


module.exports = router;
