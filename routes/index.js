'use strict';
var express = require('express');
var router = express.Router();
var Teacher = require('../models/teacherSchema');
var Student = require('../models/studentSchema');
var passport = require('passport');

router.get('/', function(req, res, next) {
  res.render('index', { user: req.user });
});

router.post('/register', function(req, res, next){
  if (req.body.type === 'student') {
    Student.create({
      displayName: req.user.displayName,
      email: req.user.emails[0].value,
      image: req.user.photos[0].value,
      type: 'student'
    }, function(err, student){
      res.json(student);
    });
  } else if (req.body.type === 'teacher'){
    Teacher.create({
      displayName: req.user.displayName,
      email: req.user.emails[0].value,
      image: req.user.photos[0].value,
      type: 'teacher'
    }, function(err, teacher){
      res.json(teacher);
    });
  }
});

router.get('/user',  function(req, res){
  res.json(req.user);
});

router.get('/auth/google',
  passport.authenticate('google',  { scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email' ] }),
  function(req, res){

  });

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    if (req.user.type === 'teacher') {
      res.redirect('/#/teacher');
    } else if (req.user.type === 'student') {
      res.redirect('/#/student');
    } else {
      res.redirect('/');
    }
  });

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


module.exports = router;
