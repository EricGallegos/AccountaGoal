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
      //Get repeating goals + todays goals and combine them for viewing
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

      let chartData = generateChart(await Goals.find({user: req.user.id,}).lean(), await Goals.find({
        user: req.user.id,
        completedOn: {$ne: null},
        $expr: {$lt:["completeOn", "dueDate"]}
      }).lean())

      //Get goals for user for next 4 days
      let upcoming = new Array;
      for( let i = 0; i < 4; i++){
        upcoming.push(await Goals.find({
                                        user: req.user.id,
                                        dueDate: { $gt: moment(new Date()).add(i+1, 'days') },
                                        startDate: { $lt: moment(new Date()).add(i+1, 'days')},
                                        repeating: false,
                                      }).lean() )
      }

      //Attach the goals to an object that also has the name of the day
      let futureGoals = new Array;
      for( let i = 0; i < 4; i++ ){
        futureGoals.push({name: moment(new Date()).add(i+1, 'days').format('dddd'),
                          goals: upcoming.shift(),
                        })
      }

      res.render('dashboard', {
        name: req.user.firstName,
        todaysGoals,
        chartData,
        futureGoals,
      });
    } catch (e) {
      console.error(e);
      res.render('error/500');
    }
  },
}

function generateChart(all, completed){
  let totalNum;
  let completedNum;
  let dailyValues = [];

  for (let i = 0; i < 140; i++){
    totalNum = 0;
    completedNum = 0;
    let start = moment(new Date).startOf('day').add(-i, 'days').toDate();

    all.forEach(goal =>{
      if( goal.startDate.getTime() == start.getTime()){
        totalNum++;
        if( goal.completedOn ){
          completedNum++;
        }
      }
    })
    if(totalNum == 0 || completedNum == 0) {
      dailyValues.push(0);
    }else{
      dailyValues.push(completedNum/totalNum)
    }
  }
  dailyValues = dailyValues.map(val =>{
    if( val == 0) return 0;
    if( val > 0 && val <= .2) return .2;
    if( val > .2 && val <= .4) return .4;
    if( val > .4 && val <= .6) return .6;
    if( val > .6 && val <= .8) return .8;
    if( val > .8 && val <= 1) return 1;
  })
  return dailyValues;
}
