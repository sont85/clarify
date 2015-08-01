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

router.post('/question/:setId', function(req, res){
  Question.findById(req.params.setId, function(err, question){
    question.list.push(req.body);
    question.save();
    res.json(question);
  });
});

module.exports = router;
