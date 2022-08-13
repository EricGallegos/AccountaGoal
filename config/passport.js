const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');


module.exports = function(passport){
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) =>{
    const newUser = {
      googleId: profile.id,
      displayName: profile.displayName,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      image: profile.photos[0].value || "https://wilcity.com/wp-content/uploads/2020/06/115-1150152_default-profile-picture-avatar-png-green-768x805.jpg",
    }
    try {
      let user = await User.findOne( { googleId: profile.id } )
      if(user){
        console.log('user found:', user);
        done(null, user);
      }else{
        console.log('user not found:', profile.displayName, 'adding to DB');
        user = await User.create(newUser);
        done(null, user);
      }
    } catch (e) {
        console.error(e)
    }
  }
))

  passport.serializeUser(function (user, done){
    done(null, user.id)
  })

  passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
      done(err, user);
    })
  })
}
