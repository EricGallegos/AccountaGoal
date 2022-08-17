const express = require('express');
const router = express.Router();
const controller = require('../controller/goals');
const { ensureAuth } = require('../middleware/auth');

router.get('/', ensureAuth, controller.redirectDashboard)

router.put('/toggleComplete/:id', ensureAuth, controller.toggleComplete)

router.put('/toggleIncomplete/:id', ensureAuth, controller.toggleIncomplete)

router.get('/add', ensureAuth, controller.getAddGoals)

router.post('/', ensureAuth, controller.postGoal)

router.get('/edit/:id', ensureAuth, controller.getEditGoals)

router.put('/:id', ensureAuth, controller.putGoal)

router.delete('/:id', ensureAuth, controller.deleteGoal)

module.exports = router;
