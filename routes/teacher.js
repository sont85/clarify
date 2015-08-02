'use strict';
var express = require('express');
var router = express.Router();
var Teacher = require('../models/teacherSchema');
var Question = require('../models/questionSchema');

router.get('/', function(req, res, next) {
  res.render('teacher', { title: 'Teacher' });
});

router.post('/set', function(req, res){
  console.log(req.body);
  Teacher.findOne({email: 'son@gmail.com'}, function(err, teacher){
    Question.create({
      listName: req.body.setName,
      createdBy: teacher._id
    }, function(err, question) {
      teacher.questionsList.push(question._id);
      teacher.save();
      res.json('success');
    });
  });
});
router.get('/set/:setId', function(req, res){
  console.log(req.params.setId);
  Question.findById(req.params.setId, function(err, question){
    res.json(question);
  });
});

router.post('/question/:setId', function(req, res){
  Question.findById(req.params.setId, function(err, question){
    question.list.push(req.body);
    question.save();
    res.json(question);
  });
});
router.get('/allQuestion', function(req, res){
  Question.find({createdBy: '55bc42d5a6951cdac15f0926'}, function(err, allQuestion){
    res.json(allQuestion);
  });
});
router.delete('/question/:setId', function(req, res) {
  Question.findById(req.params.setId).remove().exec(function(err, question){
    Teacher.findOne({email: 'son@gmail.com'}, function(err, teacher){
      teacher.questionsList.pull(req.params.setId);
      teacher.save();
      res.json(teacher);
    });
  });
});


module.exports = router;
