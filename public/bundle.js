(function() {
  'use strict';
  var app = angular.module('app',['ui.router', 'clarity.service', 'clarity.controller', 'clarity.config']);
})();

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

(function(){
  'use strict';
  var app = angular.module('clarity.controller', []);
  var socket = io.connect('http://localhost:3000');
  app.controller('StudentCtrl', function($scope, $state, TeacherService, StudentService, $location) {
    StudentService.allTeacher()
    .success(function(teachers){
      $scope.teachers = teachers;
    }).catch(function(err){
      console.log(err);
    });

    StudentService.myTeacher()
    .success(function(teachers){
      console.log(teachers);
      $scope.myTeachers = teachers;
    }).catch(function(err){
      console.log(err);
    });

    socket.on('users count', function(msg){
      console.log(msg);
    });

    socket.on('currentTestQuestion', function(question) {
      console.log(question);
      $scope.$apply(function() {
        $scope.time = question.time;
        $scope.timeOut = false;
        $scope.currentQuestion = question;
        $scope.answer = null;
      });
      var timer = setInterval(function(){
        $scope.$apply(function(){
          $scope.time --;
        });
      }, 1000);

      setTimeout(function(){
        clearInterval(timer);
        $scope.$apply(function() {
          $scope.timeOut = true;
          $scope.time = null;
        });
        if (!$scope.studentAnswer) {
          socket.emit('answers', 'null');
        }
      }, question.time * 1000);
    });

    socket.on('result', function(msg){
      console.log(msg);
      console.log(msg.true / msg.total);
    });
    $scope.addTeacher = function(teacher){
      StudentService.addTeacher(teacher);
    };

    $scope.enterRoom = function(teacher){
      console.log(teacher._id);
      socket.emit('join', teacher._id);
      $location.url('/student/room/'+teacher._id);
    };

    $scope.submitAnswer = function() {
      console.log($scope.studentAnswer);
      socket.emit('answers', $scope.currentQuestion.answer === $scope.studentAnswer);
    };
  });

  app.controller('TeacherCtrl', function($scope, TeacherService, $location, $state){

    socket.on('result', function(msg){
      console.log(msg);
      console.log(msg.true / msg.total);
    });

    TeacherService.allQuestions()
    .success(function(allQuestion){
      console.log(allQuestion);
      $scope.allQuestion = allQuestion;
    }).catch(function(err){
      console.log(err);
    });
    $scope.addSet = function(){
      TeacherService.addSet($scope.newSetName);
      $scope.newSetName ='';
    };
    $scope.editList = function(set) {
      TeacherService.currentSet = set;
      $location.url('/teacher/questionList/'+set._id);
    };
    $scope.deleteSet = function(set) {
      TeacherService.deleteSet(set);
    };
  });
  app.controller('QuestionCtrl', function($scope, TeacherService, $location, $state, $stateParams){
    TeacherService.getCurrentSet($stateParams.setId)
    .success(function(currentSet){
      TeacherService.currentSet = currentSet;
      $scope.currentSet = currentSet;
      console.log(currentSet.createdBy);
      socket.emit('join', currentSet.createdBy);
    }).catch(function(err){
      console.log(err);
    });
    $scope.addQuestion = function() {
      TeacherService.addQuestion($scope.newQuestion);
      $scope.newQuestion = '';
    };
    $scope.startTest = function(question) {
      var roomId = $scope.currentSet.createdBy;
      socket.emit('startTest', question, roomId);
    };
    $scope.deleteQuestion = function(question){
      TeacherService.deleteQuestion(question);
    };
  });
  app.controller('MainCtrl', function($scope, $http){
    $scope.registerUser = function() {
      $http.post('http://localhost:3000/register', {type: $scope.type})
      .success(function(response){
        console.log(response);
      }).catch(function(err){
        console.error(err);
      });
    };
  });
})();

(function(){
  'use strict';
  var app = angular.module('clarity.service', []);
  app.constant('Constant', {
    url: 'http://localhost:3000/'
  });
  app.service('TeacherService', function($http, $stateParams, Constant) {
    var self = this;
    this.currentSet = null;
    this.addSet = function(newSetName){
      $http.post(Constant.url + 'teacher/set', { setName: newSetName })
      .success(function(response){
        console.log(response);
      }).catch(function(err){
        console.log(err);
      });
    };
    this.addQuestion = function(newQuestion){
      $http.post(Constant.url + 'teacher/question/'+ self.currentSet._id, newQuestion)
      .success(function(response){
        console.log(response);
      }).catch(function(err){
        console.log(err);
      });
    };
    this.allQuestions = function() {
      return $http.get(Constant.url + 'teacher/allQuestion');
    };
    this.deleteSet = function(set) {
      $http.delete(Constant.url + 'teacher/set/'+ set._id)
      .success(function(response) {
        console.log(response);
      }).catch(function(err){
        console.log(err);
      });
    };
    this.getCurrentSet = function(setId) {
      return $http.get(Constant.url + 'teacher/set/'+setId);
    };
    this.deleteQuestion = function(question){
      $http.delete(Constant.url + 'teacher/question/'+ self.currentSet._id + '/'+ question._id)
      .success(function(response) {
        console.log(response);
      }).catch(function(err){
        console.log(err);
      });
    };

  });
  app.service('StudentService', function($http, Constant) {
    this.allTeacher = function() {
      return $http.get(Constant.url + 'teachers');
    };
    this.addTeacher = function(teacher){
      $http.patch(Constant.url + 'addteacher', teacher)
      .success(function(response){
        console.log(response);
      }).catch(function(err){
        console.log(err);
      });
      console.log(teacher);
    };
    this.myTeacher = function() {
      return $http.get(Constant.url + 'myteachers');
    };
  });
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbmZpZy5qcyIsImNvbnRyb2xsZXIuanMiLCJzZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcCcsWyd1aS5yb3V0ZXInLCAnY2xhcml0eS5zZXJ2aWNlJywgJ2NsYXJpdHkuY29udHJvbGxlcicsICdjbGFyaXR5LmNvbmZpZyddKTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdjbGFyaXR5LmNvbmZpZycsIFtdKTtcbiAgYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKXtcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgIC5zdGF0ZSgnaG9tZScsIHtcbiAgICAgICAgdXJsOiAnLycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnLi4vaHRtbC9tYWluLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnTWFpbkN0cmwnXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdzdHVkZW50Jywge1xuICAgICAgICB1cmw6ICcvc3R1ZGVudCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnLi4vaHRtbC9zdHVkZW50Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnU3R1ZGVudEN0cmwnXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdyb29tJywge1xuICAgICAgICB1cmw6ICcvc3R1ZGVudC9yb29tLzpyb29tSWQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy4uL2h0bWwvcm9vbS5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1N0dWRlbnRDdHJsJ1xuICAgICAgfSlcbiAgICAgIC5zdGF0ZSgndGVhY2hlcicsIHtcbiAgICAgICAgdXJsOiAnL3RlYWNoZXInLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy4uL2h0bWwvdGVhY2hlci5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1RlYWNoZXJDdHJsJ1xuICAgICAgfSlcbiAgICAgIC5zdGF0ZSgncXVlc3Rpb25MaXN0Jywge1xuICAgICAgICB1cmw6ICcvdGVhY2hlci9xdWVzdGlvbkxpc3QvOnNldElkJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcuLi9odG1sL3F1ZXN0aW9uTGlzdC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1F1ZXN0aW9uQ3RybCdcbiAgICAgIH0pO1xuICB9KTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24oKXtcbiAgJ3VzZSBzdHJpY3QnO1xuICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2NsYXJpdHkuY29udHJvbGxlcicsIFtdKTtcbiAgdmFyIHNvY2tldCA9IGlvLmNvbm5lY3QoJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcpO1xuICBhcHAuY29udHJvbGxlcignU3R1ZGVudEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgVGVhY2hlclNlcnZpY2UsIFN0dWRlbnRTZXJ2aWNlLCAkbG9jYXRpb24pIHtcbiAgICBTdHVkZW50U2VydmljZS5hbGxUZWFjaGVyKClcbiAgICAuc3VjY2VzcyhmdW5jdGlvbih0ZWFjaGVycyl7XG4gICAgICAkc2NvcGUudGVhY2hlcnMgPSB0ZWFjaGVycztcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpe1xuICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9KTtcblxuICAgIFN0dWRlbnRTZXJ2aWNlLm15VGVhY2hlcigpXG4gICAgLnN1Y2Nlc3MoZnVuY3Rpb24odGVhY2hlcnMpe1xuICAgICAgY29uc29sZS5sb2codGVhY2hlcnMpO1xuICAgICAgJHNjb3BlLm15VGVhY2hlcnMgPSB0ZWFjaGVycztcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpe1xuICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9KTtcblxuICAgIHNvY2tldC5vbigndXNlcnMgY291bnQnLCBmdW5jdGlvbihtc2cpe1xuICAgICAgY29uc29sZS5sb2cobXNnKTtcbiAgICB9KTtcblxuICAgIHNvY2tldC5vbignY3VycmVudFRlc3RRdWVzdGlvbicsIGZ1bmN0aW9uKHF1ZXN0aW9uKSB7XG4gICAgICBjb25zb2xlLmxvZyhxdWVzdGlvbik7XG4gICAgICAkc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xuICAgICAgICAkc2NvcGUudGltZSA9IHF1ZXN0aW9uLnRpbWU7XG4gICAgICAgICRzY29wZS50aW1lT3V0ID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5jdXJyZW50UXVlc3Rpb24gPSBxdWVzdGlvbjtcbiAgICAgICAgJHNjb3BlLmFuc3dlciA9IG51bGw7XG4gICAgICB9KTtcbiAgICAgIHZhciB0aW1lciA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS4kYXBwbHkoZnVuY3Rpb24oKXtcbiAgICAgICAgICAkc2NvcGUudGltZSAtLTtcbiAgICAgICAgfSk7XG4gICAgICB9LCAxMDAwKTtcblxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKTtcbiAgICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcbiAgICAgICAgICAkc2NvcGUudGltZU91dCA9IHRydWU7XG4gICAgICAgICAgJHNjb3BlLnRpbWUgPSBudWxsO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCEkc2NvcGUuc3R1ZGVudEFuc3dlcikge1xuICAgICAgICAgIHNvY2tldC5lbWl0KCdhbnN3ZXJzJywgJ251bGwnKTtcbiAgICAgICAgfVxuICAgICAgfSwgcXVlc3Rpb24udGltZSAqIDEwMDApO1xuICAgIH0pO1xuXG4gICAgc29ja2V0Lm9uKCdyZXN1bHQnLCBmdW5jdGlvbihtc2cpe1xuICAgICAgY29uc29sZS5sb2cobXNnKTtcbiAgICAgIGNvbnNvbGUubG9nKG1zZy50cnVlIC8gbXNnLnRvdGFsKTtcbiAgICB9KTtcbiAgICAkc2NvcGUuYWRkVGVhY2hlciA9IGZ1bmN0aW9uKHRlYWNoZXIpe1xuICAgICAgU3R1ZGVudFNlcnZpY2UuYWRkVGVhY2hlcih0ZWFjaGVyKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmVudGVyUm9vbSA9IGZ1bmN0aW9uKHRlYWNoZXIpe1xuICAgICAgY29uc29sZS5sb2codGVhY2hlci5faWQpO1xuICAgICAgc29ja2V0LmVtaXQoJ2pvaW4nLCB0ZWFjaGVyLl9pZCk7XG4gICAgICAkbG9jYXRpb24udXJsKCcvc3R1ZGVudC9yb29tLycrdGVhY2hlci5faWQpO1xuICAgIH07XG5cbiAgICAkc2NvcGUuc3VibWl0QW5zd2VyID0gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zb2xlLmxvZygkc2NvcGUuc3R1ZGVudEFuc3dlcik7XG4gICAgICBzb2NrZXQuZW1pdCgnYW5zd2VycycsICRzY29wZS5jdXJyZW50UXVlc3Rpb24uYW5zd2VyID09PSAkc2NvcGUuc3R1ZGVudEFuc3dlcik7XG4gICAgfTtcbiAgfSk7XG5cbiAgYXBwLmNvbnRyb2xsZXIoJ1RlYWNoZXJDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBUZWFjaGVyU2VydmljZSwgJGxvY2F0aW9uLCAkc3RhdGUpe1xuXG4gICAgc29ja2V0Lm9uKCdyZXN1bHQnLCBmdW5jdGlvbihtc2cpe1xuICAgICAgY29uc29sZS5sb2cobXNnKTtcbiAgICAgIGNvbnNvbGUubG9nKG1zZy50cnVlIC8gbXNnLnRvdGFsKTtcbiAgICB9KTtcblxuICAgIFRlYWNoZXJTZXJ2aWNlLmFsbFF1ZXN0aW9ucygpXG4gICAgLnN1Y2Nlc3MoZnVuY3Rpb24oYWxsUXVlc3Rpb24pe1xuICAgICAgY29uc29sZS5sb2coYWxsUXVlc3Rpb24pO1xuICAgICAgJHNjb3BlLmFsbFF1ZXN0aW9uID0gYWxsUXVlc3Rpb247XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKXtcbiAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgfSk7XG4gICAgJHNjb3BlLmFkZFNldCA9IGZ1bmN0aW9uKCl7XG4gICAgICBUZWFjaGVyU2VydmljZS5hZGRTZXQoJHNjb3BlLm5ld1NldE5hbWUpO1xuICAgICAgJHNjb3BlLm5ld1NldE5hbWUgPScnO1xuICAgIH07XG4gICAgJHNjb3BlLmVkaXRMaXN0ID0gZnVuY3Rpb24oc2V0KSB7XG4gICAgICBUZWFjaGVyU2VydmljZS5jdXJyZW50U2V0ID0gc2V0O1xuICAgICAgJGxvY2F0aW9uLnVybCgnL3RlYWNoZXIvcXVlc3Rpb25MaXN0Lycrc2V0Ll9pZCk7XG4gICAgfTtcbiAgICAkc2NvcGUuZGVsZXRlU2V0ID0gZnVuY3Rpb24oc2V0KSB7XG4gICAgICBUZWFjaGVyU2VydmljZS5kZWxldGVTZXQoc2V0KTtcbiAgICB9O1xuICB9KTtcbiAgYXBwLmNvbnRyb2xsZXIoJ1F1ZXN0aW9uQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgVGVhY2hlclNlcnZpY2UsICRsb2NhdGlvbiwgJHN0YXRlLCAkc3RhdGVQYXJhbXMpe1xuICAgIFRlYWNoZXJTZXJ2aWNlLmdldEN1cnJlbnRTZXQoJHN0YXRlUGFyYW1zLnNldElkKVxuICAgIC5zdWNjZXNzKGZ1bmN0aW9uKGN1cnJlbnRTZXQpe1xuICAgICAgVGVhY2hlclNlcnZpY2UuY3VycmVudFNldCA9IGN1cnJlbnRTZXQ7XG4gICAgICAkc2NvcGUuY3VycmVudFNldCA9IGN1cnJlbnRTZXQ7XG4gICAgICBjb25zb2xlLmxvZyhjdXJyZW50U2V0LmNyZWF0ZWRCeSk7XG4gICAgICBzb2NrZXQuZW1pdCgnam9pbicsIGN1cnJlbnRTZXQuY3JlYXRlZEJ5KTtcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpe1xuICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9KTtcbiAgICAkc2NvcGUuYWRkUXVlc3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgICAgIFRlYWNoZXJTZXJ2aWNlLmFkZFF1ZXN0aW9uKCRzY29wZS5uZXdRdWVzdGlvbik7XG4gICAgICAkc2NvcGUubmV3UXVlc3Rpb24gPSAnJztcbiAgICB9O1xuICAgICRzY29wZS5zdGFydFRlc3QgPSBmdW5jdGlvbihxdWVzdGlvbikge1xuICAgICAgdmFyIHJvb21JZCA9ICRzY29wZS5jdXJyZW50U2V0LmNyZWF0ZWRCeTtcbiAgICAgIHNvY2tldC5lbWl0KCdzdGFydFRlc3QnLCBxdWVzdGlvbiwgcm9vbUlkKTtcbiAgICB9O1xuICAgICRzY29wZS5kZWxldGVRdWVzdGlvbiA9IGZ1bmN0aW9uKHF1ZXN0aW9uKXtcbiAgICAgIFRlYWNoZXJTZXJ2aWNlLmRlbGV0ZVF1ZXN0aW9uKHF1ZXN0aW9uKTtcbiAgICB9O1xuICB9KTtcbiAgYXBwLmNvbnRyb2xsZXIoJ01haW5DdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCl7XG4gICAgJHNjb3BlLnJlZ2lzdGVyVXNlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgJGh0dHAucG9zdCgnaHR0cDovL2xvY2FsaG9zdDozMDAwL3JlZ2lzdGVyJywge3R5cGU6ICRzY29wZS50eXBlfSlcbiAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfSk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCl7XG4gICd1c2Ugc3RyaWN0JztcbiAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdjbGFyaXR5LnNlcnZpY2UnLCBbXSk7XG4gIGFwcC5jb25zdGFudCgnQ29uc3RhbnQnLCB7XG4gICAgdXJsOiAnaHR0cDovL2xvY2FsaG9zdDozMDAwLydcbiAgfSk7XG4gIGFwcC5zZXJ2aWNlKCdUZWFjaGVyU2VydmljZScsIGZ1bmN0aW9uKCRodHRwLCAkc3RhdGVQYXJhbXMsIENvbnN0YW50KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuY3VycmVudFNldCA9IG51bGw7XG4gICAgdGhpcy5hZGRTZXQgPSBmdW5jdGlvbihuZXdTZXROYW1lKXtcbiAgICAgICRodHRwLnBvc3QoQ29uc3RhbnQudXJsICsgJ3RlYWNoZXIvc2V0JywgeyBzZXROYW1lOiBuZXdTZXROYW1lIH0pXG4gICAgICAuc3VjY2VzcyhmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycil7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICB9KTtcbiAgICB9O1xuICAgIHRoaXMuYWRkUXVlc3Rpb24gPSBmdW5jdGlvbihuZXdRdWVzdGlvbil7XG4gICAgICAkaHR0cC5wb3N0KENvbnN0YW50LnVybCArICd0ZWFjaGVyL3F1ZXN0aW9uLycrIHNlbGYuY3VycmVudFNldC5faWQsIG5ld1F1ZXN0aW9uKVxuICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpe1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgICB0aGlzLmFsbFF1ZXN0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICRodHRwLmdldChDb25zdGFudC51cmwgKyAndGVhY2hlci9hbGxRdWVzdGlvbicpO1xuICAgIH07XG4gICAgdGhpcy5kZWxldGVTZXQgPSBmdW5jdGlvbihzZXQpIHtcbiAgICAgICRodHRwLmRlbGV0ZShDb25zdGFudC51cmwgKyAndGVhY2hlci9zZXQvJysgc2V0Ll9pZClcbiAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycil7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICB9KTtcbiAgICB9O1xuICAgIHRoaXMuZ2V0Q3VycmVudFNldCA9IGZ1bmN0aW9uKHNldElkKSB7XG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KENvbnN0YW50LnVybCArICd0ZWFjaGVyL3NldC8nK3NldElkKTtcbiAgICB9O1xuICAgIHRoaXMuZGVsZXRlUXVlc3Rpb24gPSBmdW5jdGlvbihxdWVzdGlvbil7XG4gICAgICAkaHR0cC5kZWxldGUoQ29uc3RhbnQudXJsICsgJ3RlYWNoZXIvcXVlc3Rpb24vJysgc2VsZi5jdXJyZW50U2V0Ll9pZCArICcvJysgcXVlc3Rpb24uX2lkKVxuICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgfSk7XG4gIGFwcC5zZXJ2aWNlKCdTdHVkZW50U2VydmljZScsIGZ1bmN0aW9uKCRodHRwLCBDb25zdGFudCkge1xuICAgIHRoaXMuYWxsVGVhY2hlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICRodHRwLmdldChDb25zdGFudC51cmwgKyAndGVhY2hlcnMnKTtcbiAgICB9O1xuICAgIHRoaXMuYWRkVGVhY2hlciA9IGZ1bmN0aW9uKHRlYWNoZXIpe1xuICAgICAgJGh0dHAucGF0Y2goQ29uc3RhbnQudXJsICsgJ2FkZHRlYWNoZXInLCB0ZWFjaGVyKVxuICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpe1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgfSk7XG4gICAgICBjb25zb2xlLmxvZyh0ZWFjaGVyKTtcbiAgICB9O1xuICAgIHRoaXMubXlUZWFjaGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KENvbnN0YW50LnVybCArICdteXRlYWNoZXJzJyk7XG4gICAgfTtcbiAgfSk7XG59KSgpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9