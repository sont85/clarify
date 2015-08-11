(function() {
  'use strict';
  var app = angular.module('app', ['ui.router', 'clarity.service', 'clarity.service.charts', 'clarity.controller.student', 'clarity.controller.teacher', 'clarity.config']);
})();
// var socket = io.connect('http://localhost:3000');
var socket = io.connect('https://clarity.herokuapp.com');
