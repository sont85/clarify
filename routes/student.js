'use strict';
var express = require('express');
var router = express.Router();
var Teacher = require('../models/teacherSchema');
var Question = require('../models/questionSchema');
var Student = require('../models/studentSchema');
var Point = require('../models/pointSchema');

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
router.patch('/point/:teacherId', function(req, res){
  Point.findOne({studentId: req.user._id, teacherId: req.params.teacherId}, function(err, point){
    point.points ++;
    point.save();
  });
});
router.get('/point/:teacherId', function(req, res){
  Point.findOne({studentId: req.user._id, teacherId: req.params.teacherId}, function(err, point){
    res.json(point);
  });
});
module.exports = router;
