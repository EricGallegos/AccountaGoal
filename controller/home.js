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

      const allGoals = await Goals.find({
        user: req.user.id,
      }).lean();

      let todaysGoals = allGoals.filter( goal => {
        if( goal.dueDate.getTime() > now &&
            goal.startDate.getTime() < now &&
            goal.repeating == 'false') return true;
        return false;
      })
      // count archived goals
      let numArchived = 0;
      todaysGoals.forEach( goal =>{
        if(goal.archived) numArchived++;
      })

      // Get all repeating goals that should appear
      let repeatingGoals = allGoals.filter( goal => {
        if( goal.repeating == 'true' &&
            goal.archived == false &&
            goal.startDate.getTime() < now.getTime() ) return true;
        return false;
      })
      // If fewer archived goals than repeating goals we must add new archived goals
      if(repeatingGoals.length > numArchived ){
        // Check for a archived goal with a matching creatorID
        repeatingGoals.forEach( async goal => {
            const found = await Goals.findOne({
              creatorID: goal._id,
              archived: true,
            })
            // If matching creatorID not found, create new archived goal
            if( !found ){
              await Goals.create({
                user: req.user.id,
                dueDate: now,
                repeating: 'false',
                body: goal.body,
                archived: true,
                creatorID: goal._id,
              })
            }
        })

        // Get all todays goals after adding temp versions of repeating goals
        todaysGoals = await Goals.find({
                                        user: req.user.id,
                                        dueDate: { $gt: now },
                                        startDate: { $lt: now},
                                        repeating: false,
                                      }).lean();
      }


      // Get all goal data to build history chart
      const totalGoals = allGoals.filter( goal => {
        if(goal.repeating == 'false') return true;
        return false;
      })
      const totalCompleted = allGoals.filter( goal => {
        if( goal.repeating == 'false' &&
            goal.status == 'complete' &&
            goal.completedOn.getTime() < goal.dueDate.getTime() ) return true;
        return false;
      })
      let chartData = generateChart(totalGoals, totalCompleted, now);
      console.log(totalCompleted)

      //Get goals for user for next 4 days
      let upcoming = new Array;
      for( let i = 0; i < 4; i++){
        upcoming.push( allGoals.filter( goal => {
          if( goal.dueDate.getTime() > moment(now).add(i+1, 'days').toDate().getTime() &&
              goal.startDate.getTime() < moment(now).add(i+1, 'days').toDate().getTime() &&
              goal.repeating == 'false' ) return true;
          return false;
        }))
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
}
