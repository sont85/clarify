'use strict';
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Clarity' });
});
router.get('/teacher', function(req, res, next) {
  res.render('teacher', { title: 'Teacher' });
});
router.get('/student', function(req, res, next) {
  res.render('student', { title: 'Student' });
});

router.get('/register', function(req, res, next){
  res.render('register', {title : 'Register'});
});

module.exports = router;
