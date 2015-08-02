'use strict';
var express = require('express');
var router = express.Router();
var Teacher = require('../models/teacherSchema');
var Question = require('../models/questionSchema');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Clarity' });
});

module.exports = router;
