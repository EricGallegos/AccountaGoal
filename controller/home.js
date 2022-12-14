const Goals  = require('../models/Goal');
const User = require('../models/User')
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
      // Timezone offset ================================================
      let tzOffset = await User.findById(req.user.id, 'tzOffset').lean();
      req.session.tzOffset = tzOffset.tzOffset;
      let now = new Date();
      now = moment(now).add(6, 'hours').toDate();
      now = moment(now).add(req.session.tzOffset, 'hours').toDate();

      // Get users goals from db ========================================
      const allGoals = await Goals.find({
        user: req.user.id,
      }).lean();

      let todaysGoals = allGoals.filter( goal => {
        if( goal.repeating == 'false' &&
            goal.dueDate.getTime() > now.getTime() &&
            goal.startDate.getTime() < now.getTime()
            ) return true;
        return false;
      })
      let todaysArchivedWeeklyGoals = allGoals.filter( goal =>{
        if( goal.repeating == 'weekly' &&
            goal.archived == true &&
            goal.dueDate.getTime() > now.getTime() &&
            goal.startDate.getTime() < now.getTime()) return true;
        return false;
      })
      todaysGoals = todaysGoals.concat(todaysArchivedWeeklyGoals)

      let weeklyGoals = allGoals.filter( goal => {
        if( goal.repeating == 'weekly' &&
            goal.archived == false &&
            goal.daysOfWeek.includes( moment(now).format('dddd').toString() ) ) {
              return true;
            }
        return false;
      })

      if(todaysArchivedWeeklyGoals.length < weeklyGoals.length){
        weeklyGoals.forEach( async weekly =>{
          const found = todaysArchivedWeeklyGoals.filter( goal => {
            if( goal.creatorID == weekly._id &&
                goal.archived == true &&
                goal.dueDate.getTime() > now.getTime() &&
                goal.startDate.getTime() < now.getTime() ) return true;
            return false;
          })
          console.log(found);
          if( found.length == 0 ){
            //console.log('creating goal based on ', weekly);
            await Goals.create({
              user: req.user.id,
              dueDate: now,
              repeating: 'weekly',
              status: 'incomplete',
              body: weekly.body,
              archived: true,
              creatorID: weekly._id,
            })
          }
        })
        res.redirect('/dashboard'); // If new goals were added reload the page
      }
      // count archived goals
      let numArchived = 0;
      todaysGoals.forEach( goal =>{
        if(goal.archived && goal.repeating != 'weekly') numArchived++;
      })

      // Get all repeating goals that should appear
      let repeatingGoals = allGoals.filter( goal => {
        if( goal.repeating == 'true' &&
            goal.archived == false &&
            goal.startDate.getTime() < now.getTime() ) return true;
        return false;
      })


      //If fewer archived goals than repeating goals we must add new archived goals
      if(repeatingGoals.length > numArchived ){
        // Check for a archived goal with a matching creatorID
        repeatingGoals.forEach( async repeating => {
          const found = allGoals.filter( goal => {
            if( goal.creatorID == repeating._id &&
                goal.archived == true &&
                goal.dueDate.getTime() > now.getTime() &&
                goal.startDate.getTime() < now.getTime()) return true;
            return false;
          });
            // If matching creatorID not found, create new archived goal
            if( found.length == 0 ){
              await Goals.create({
                user: req.user.id,
                dueDate: now,
                repeating: 'false',
                status: 'incomplete',
                body: repeating.body,
                archived: true,
                creatorID: repeating._id,
              })
              // Get all todays goals after adding temp versions of repeating goals
            //   todaysGoals = await Goals.find({
            //                                   user: req.user.id,
            //                                   dueDate: { $gt: now },
            //                                   startDate: { $lt: now},
            //                                   repeating: false,
            //                                 }).lean();
          }
        })
        res.redirect('/dashboard'); // If new goals were added reload the page
      }


      // Get goal data to build history chart
      const totalGoals = allGoals.filter( goal => {
        if(goal.repeating == 'false' || goal.archived) return true;
        return false;
      })
      const totalCompleted = totalGoals.filter( goal => {
        if( goal.status == 'complete' &&
            goal.completedOn.getTime() < goal.dueDate.getTime() ) return true;
        return false;
      })
      const chartData = generateChart(totalGoals, totalCompleted, now);

      //Get goals for user for next 6 days
      let upcoming = new Array;
      for( let i = 0; i < 6; i++){
        upcoming.push( allGoals.filter( goal => {
          if( goal.dueDate.getTime() > moment(now).add(i+1, 'days').toDate().getTime() &&
              goal.startDate.getTime() < moment(now).add(i+1, 'days').toDate().getTime() &&
              goal.archived == false && goal.repeating == 'false' ) return true;
          return false;
        }))
        upcoming[i] = upcoming[i].concat( repeatingGoals.filter( goal => {
          if( goal.startDate.getTime() < moment(now).add(i+1, 'days').toDate().getTime() ) return true;
          return false;
        }))
        upcoming[i] = upcoming[i].concat( allGoals.filter( goal => {
          if( goal.repeating == 'weekly' &&
              goal.daysOfWeek.includes( moment(now).add(i+1, 'days').format('dddd').toString() ) ) return true;
          return false;
        }))
        upcoming[i] = upcoming[i].slice(0, 10);
      }

      //Attach the goals to an object that also has the name of the day
      let futureGoals = new Array;
      for( let i = 0; i < 6; i++ ){
        futureGoals.push({name: moment(now).add(i+1, 'days').format('dddd, MMM Do'),
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

  // @desc     PrivacyPolicy
  // @route    GET /about/privacypolicy
  getAbout: async (req, res) =>{
    res.sendFile('views/privacyPolicy.html', {root: __dirname + '/..'} )
  },

  // @desc     Delete account
  // @route    DELETE /account/deleteAccount
  deleteAccount: async (req, res) => {
    try {
      await Goals.deleteMany({
        user: req.user.id,
      })
      await User.deleteOne({
        _id: req.user.id,
      })
      res.redirect('/')
    } catch (e) {
      console.error(e);
      res.redirect('/error/500')
    }
  },

  updateTZ: async (req, res) => {
    await User.findByIdAndUpdate( req.user.id, {tzOffset: +req.body.tzOffset} );
    res.redirect('/dashboard');
  }

}


function generateChart(all, completed, now){
  let totalNum;
  let completedNum;
  let dailyValues = [];
  let dates = [];
  let finished = [];
  let total = [];

  for (let i = 0; i < 112; i++){
    totalNum = 0;
    completedNum = 0;
    let start = moment(now).startOf('day').add(-i, 'days').toDate();
    dates.push(moment(now).add(-i, 'days').format('dddd, MMMM Do YYYY'))
    completed.forEach( completedGoal =>{
      if( completedGoal.startDate.getTime() == start.getTime()){
        completedNum++;
      }
    })
    finished.push(completedNum);
    all.forEach( goal =>{
      if( goal.startDate.getTime() == start.getTime()){
        totalNum++;
      }
    })
    total.push(totalNum)
    if(totalNum == 0 || completedNum == 0) {
      dailyValues.push(0);
    }else{
      dailyValues.push(completedNum/totalNum)
    }
  }
  dailyValues = dailyValues.map(val =>{
    if( val == 0) return 0;
    if( val > 0 && val <= .1 ) return .1;
    if( val > .1 && val <= .2 ) return .2;
    if( val > .2 && val <= .3 ) return .3;
    if( val > .3 && val <= .4 ) return .4;
    if( val > .4 && val <= .5 ) return .5;
    if( val > .5 && val <= .6 ) return .6;
    if( val > .6 && val <= .7 ) return .7;
    if( val > .7 && val <= .8 ) return .8;
    if( val > .8 && val <= .9 ) return .9;
    if( val > .9 && val <= 1 ) return 1;
  })

  dailyValues = dailyValues.map( (value, i, arr) => {
    return {
      percentage: value,
      date: dates[i],
      completed: finished[i],
      total: total[i],
    }
  })

  return dailyValues;
}
