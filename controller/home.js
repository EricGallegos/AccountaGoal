const Goals  = require('../models/Goal');
const moment = require('moment');
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
      const repeatingGoals = await Goals.find({
                                      user: req.user.id,
                                      repeating: true,
                                    }).lean();
      let todaysGoals = await Goals.find({
                                      user: req.user.id,
                                      dueDate: { $gt: new Date() },
                                      startDate: { $lt: new Date()},
                                      repeating: false,
                                    }).lean();
      todaysGoals = repeatingGoals.concat(todaysGoals);

      let upcoming = new Array;

      for( let i = 0; i < 4; i++){
        upcoming.push(await Goals.find({
                                        user: req.user.id,
                                        dueDate: { $gt: moment(new Date()).add(i+1, 'days') },
                                        startDate: { $lt: moment(new Date()).add(i+1, 'days')},
                                        repeating: false,
                                      }).lean() )
      }
      let futureGoals = new Array;
      for( let i = 0; i < 4; i++ ){
        futureGoals.push({name: moment(new Date()).add(i+1, 'days').format('dddd'),
                       goals: upcoming.shift().slice(0, 5),
                     })
      }

      res.render('dashboard', {
        name: req.user.firstName,
        todaysGoals,
        futureGoals,
      });
    } catch (e) {
      console.error(e);
      res.render('error/500');
    }
  },
}
