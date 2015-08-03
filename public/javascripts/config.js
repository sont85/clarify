(function() {
  'use strict';
  var app = angular.module('clarity.config', []);
  app.config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise('/');
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: '../html/main.html',
        controller: 'MainCtrl'
      })
      .state('student', {
        url: '/student',
        templateUrl: '../html/student.html',
        controller: 'StudentCtrl'
      })
      .state('teacher', {
        url: '/teacher',
        templateUrl: '../html/teacher.html',
        controller: 'TeacherCtrl'
      })
      .state('questionList', {
        url: '/teacher/questionList/:setId',
        templateUrl: '../html/questionList.html',
        controller: 'QuestionCtrl'
      });
  });
})();
