'use strict';
var express = require('express');
var router = express.Router();
var Teacher = require('../models/teacherSchema');
var Question = require('../models/questionSchema');

router.get('/', function(req, res, next) {
  res.render('teacher', { title: 'Teacher' });
});
router.post('/addSet', function(req, res){
  console.log(req.body)
  console.log("-------------------")
});

module.exports = router;
