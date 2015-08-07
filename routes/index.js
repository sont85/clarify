'use strict';
var express = require('express');
var router = express.Router();
var Teacher = require('../models/teacherSchema');
var Question = require('../models/questionSchema');
var Student = require('../models/studentSchema');
var Point = require('../models/pointSchema');
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

router.get('/teachers', function(req, res){
  Teacher.find({}, function(err, teachers){
    res.json(teachers);
  });
});
router.get('/myteachers', function(req, res) {
  Student.findById(req.user._id).populate('teacher').exec(function(err, student){
    res.json(student.teacher);
  });
});
router.patch('/addteacher', function(req, res){
  Student.findById(req.user._id, function(err, student){
    Point.findOne({studentId: req.user._id, teacherId: req.body._id}, function(err, point){
      if (!point) {
        Point.create({
          studentId: req.user._id,
          studentName: req.user.displayName,
          teacherId: req.body._id,
          teacherName: req.body.displayName,
          points: 0
        }, function(err, point){
          student.teacher.push(req.body._id);
          student.points.push(point._id);
          student.save();
        });
      }
    });
  });

});
router.patch('/student/point/:roomId', function(req, res){
  console.log("userId",req.user._id);
  console.log("roomId",req.params.roomId);
  Point.findOne({studentId: req.user._id, teacherId: req.params.roomId}, function(err, point){
    console.log(point)
    point.points ++;
    point.save();
  });
});

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
router.get('/auth/google',
  passport.authenticate('google',  { scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email' ] }),
  function(req, res){
    // The request will be redirected to Google for authentication, so this
    // function will not be called.
  });

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

module.exports = router;
