(function() {
  'use strict';
  var app = angular.module('clarity.config', []);
  app.config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise('/');
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: '../html/main.html'
      })
      .state('student', {
        url: '/student',
        templateUrl: '../html/student.html',
        controller: 'StudentCtrl'
      })
      .state('room', {
        url: '/student/room/:roomId',
        templateUrl: '../html/room.html',
        controller: 'RoomCtrl'
      })
      .state('teacher', {
        url: '/teacher',
        templateUrl: '../html/teacher.html',
        controller: 'TeacherCtrl'
      })
      .state('questionList', {
        url: '/teacher/questionList/:setId',
        templateUrl: '../html/questionList.html',
        controller: 'QuestionListCtrl'
      })
      .state('question', {
        url:'/teacher/:setId/question/:questionId',
        templateUrl: '../html/question.html',
        controller: 'QuestionCtrl'
      });
  });
})();
