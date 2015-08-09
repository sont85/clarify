(function() {
  'use strict';
  var app = angular.module('app',['ui.router', 'clarity.service', 'clarity.controller.student', 'clarity.controller.teacher', 'clarity.config']);
})();
var socket = io.connect('http://localhost:3000');
