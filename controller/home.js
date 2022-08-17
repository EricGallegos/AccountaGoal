const Goals  = require('../models/Goal');

module.exports = {
  // @desc     Login / Landing page
  // @route    GET /
  getLanding: (req, res) => {
    res.render('login', {
      layout: 'login',
    });
  },

  // @desc     Dashboard
  // @route    GET /dashboard
  getDashboard: async (req, res) => {
    try {
      const goals = await Goals.find({ user: req.user.id }).lean()

      res.render('dashboard', {
        name: req.user.firstName,
        goals,
      });
    } catch (e) {
      console.error(e);
      res.render('error/500');
    }
  },
}
