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
      const now = new Date();
      let todaysGoals = await Goals.find({
                                      user: req.user.id,
                                      dueDate: { $gt: now },
                                      startDate: { $lt: now},
                                      repeating: false,
                                    }).lean()
      // count archived goals
      let found = 0;
      todaysGoals.forEach( goal =>{
        if(goal.archived) found++;
      })

      // Get all repeating goals that should appear
      repeatingGoals = await Goals.find({
                    user: req.user.id,
                    repeating: true,
                    archived: false,
                    startDate: {$lt: now}
                  }).lean();


      // If fewer archived goals than repeating goals we must add new archived goals
      if(repeatingGoals.length > found ){
        repeatingGoals.forEach( async goal => {
            found = await Goals.findOne({
              body: goal.body,
              archived: true,
            })

            if( !found ){
              await Goals.create({
                user: req.user.id,
                dueDate: now,
                repeating: false,
                body: goal.body,
                archived: true,
                creatorID: goal._id,
              })
            }
        })
      }
      // Get all todays goals after adding temp versions of repeating goals
      todaysGoals = await Goals.find({
                                      user: req.user.id,
                                      dueDate: { $gt: now },
                                      startDate: { $lt: now},
                                      repeating: false,
                                    }).lean();


      // Get all goal data to build history chart
      let chartData = generateChart(await Goals.find({
          user: req.user.id,
          repeating: false,
        }).lean(),

         await Goals.find({
          user: req.user.id,
          completedOn: {$ne: null},
          $expr: {$lt:["completeOn", "dueDate"]}
        }).lean(),

        now
      )

      //Get goals for user for next 4 days
      let upcoming = new Array;
      for( let i = 0; i < 4; i++){
        upcoming.push(await Goals.find({
                                        user: req.user.id,
                                        dueDate: { $gt: moment(now).add(i+1, 'days') },
                                        startDate: { $lt: moment(now).add(i+1, 'days')},
                                        repeating: false,
                                      }).lean() )
      }

      //Attach the goals to an object that also has the name of the day
      let futureGoals = new Array;
      for( let i = 0; i < 4; i++ ){
        futureGoals.push({name: moment(now).add(i+1, 'days').format('dddd'),
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

function generateChart(all, completed, now){
  let totalNum;
  let completedNum;
  let dailyValues = [];

  for (let i = 0; i < 140; i++){
    totalNum = 0;
    completedNum = 0;
    let start = moment(now).startOf('day').add(-i, 'days').toDate();

    completed.forEach( completedGoal =>{
      if( completedGoal.startDate.getTime() == start.getTime()){
        completedNum++;
      }
    })
    all.forEach( goal =>{
      if( goal.startDate.getTime() == start.getTime()){
        totalNum++;
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
  console.log(dailyValues)
}
