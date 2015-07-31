var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/teacher', function(req, res, next) {
  res.render('teacher', { title: 'Express' });
});
router.get('/student', function(req, res, next) {
  res.render('student', { title: 'Express' });
});

module.exports = router;
