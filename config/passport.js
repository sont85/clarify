'use strict';
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var Teacher = require('../models/teacherSchema');
var Student = require('../models/studentSchema');

module.exports = function(app){
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
      process.nextTick(function () {
        Student.findOne({email: profile.emails[0].value}, function(err, student){
          if (student) {
            return done(null, student);
          } else {
            Teacher.findOne({email: profile.emails[0].value}, function(err, teacher){
              if (teacher) {
                return done(null, teacher);
              } else {
                return done(null, profile);
              }
            });
          }
        });
      });
    }
  ));
  app.use(passport.initialize());
  app.use(passport.session());

};
