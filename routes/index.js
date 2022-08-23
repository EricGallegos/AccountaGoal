const express = require('express');
const router = express.Router();
const controller = require('../controller/home')
const { ensureAuth, ensureGuest } = require('../middleware/auth');

router.get('/', ensureGuest, controller.getLanding)

router.get('/dashboard', ensureAuth, controller.getDashboard)

router.get('/about/privacypolicy', ensureAuth, controller.getAbout)

router.delete('/account/deleteAccount', ensureAuth, controller.deleteAccount)

module.exports = router;
