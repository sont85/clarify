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
      .state('set', {
        url: '/teacher/set/:setId',
        templateUrl: '../html/set.html',
        controller: 'SetCtrl'
      })
      .state('question', {
        url:'/teacher/:setId/question/:questionId',
        templateUrl: '../html/question.html',
        controller: 'QuestionCtrl'
      })
      .state('teacherChat', {
        url:'/teacher/chatroom/:roomId',
        templateUrl: '../html/chatroom.html',
        controller: 'TeacherChatCtrl'
      })
      .state('studentChat', {
        url:'/student/chatroom/:roomId',
        templateUrl: '../html/chatroom.html',
        controller: 'StudentChatCtrl'
      });
  });
})();
