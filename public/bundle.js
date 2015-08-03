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
        controller: 'StudentCtrl'
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

(function(){
  'use strict';
  var app = angular.module('clarity.controller', []);
  var socket = io.connect('http://localhost:3000');
  app.controller('StudentCtrl', function($scope, $state, TeacherService, StudentService) {
    StudentService.allTeacher()
    .success(function(teachers){
      $scope.teachers = teachers;
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
    }).catch(function(err){
      console.log(err);
    });
    $scope.addQuestion = function() {
      TeacherService.addQuestion($scope.newQuestion);
      $scope.newQuestion = '';
    };
    $scope.startTest = function(question) {
      socket.emit('startTest', question);
    };
    $scope.deleteQuestion = function(question){
      console.log(question);
      console.log(TeacherService.currentSet);
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
  });
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbmZpZy5qcyIsImNvbnRyb2xsZXIuanMiLCJzZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcCcsWyd1aS5yb3V0ZXInLCAnY2xhcml0eS5zZXJ2aWNlJywgJ2NsYXJpdHkuY29udHJvbGxlcicsICdjbGFyaXR5LmNvbmZpZyddKTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdjbGFyaXR5LmNvbmZpZycsIFtdKTtcbiAgYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKXtcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgIC5zdGF0ZSgnaG9tZScsIHtcbiAgICAgICAgdXJsOiAnLycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnLi4vaHRtbC9tYWluLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnU3R1ZGVudEN0cmwnXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdzdHVkZW50Jywge1xuICAgICAgICB1cmw6ICcvc3R1ZGVudCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnLi4vaHRtbC9zdHVkZW50Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnU3R1ZGVudEN0cmwnXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCd0ZWFjaGVyJywge1xuICAgICAgICB1cmw6ICcvdGVhY2hlcicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnLi4vaHRtbC90ZWFjaGVyLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnVGVhY2hlckN0cmwnXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdxdWVzdGlvbkxpc3QnLCB7XG4gICAgICAgIHVybDogJy90ZWFjaGVyL3F1ZXN0aW9uTGlzdC86c2V0SWQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy4uL2h0bWwvcXVlc3Rpb25MaXN0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnUXVlc3Rpb25DdHJsJ1xuICAgICAgfSk7XG4gIH0pO1xufSkoKTtcbiIsIihmdW5jdGlvbigpe1xuICAndXNlIHN0cmljdCc7XG4gIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnY2xhcml0eS5jb250cm9sbGVyJywgW10pO1xuICB2YXIgc29ja2V0ID0gaW8uY29ubmVjdCgnaHR0cDovL2xvY2FsaG9zdDozMDAwJyk7XG4gIGFwcC5jb250cm9sbGVyKCdTdHVkZW50Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCBUZWFjaGVyU2VydmljZSwgU3R1ZGVudFNlcnZpY2UpIHtcbiAgICBTdHVkZW50U2VydmljZS5hbGxUZWFjaGVyKClcbiAgICAuc3VjY2VzcyhmdW5jdGlvbih0ZWFjaGVycyl7XG4gICAgICAkc2NvcGUudGVhY2hlcnMgPSB0ZWFjaGVycztcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpe1xuICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9KTtcblxuICAgIHNvY2tldC5vbigndXNlcnMgY291bnQnLCBmdW5jdGlvbihtc2cpe1xuICAgICAgY29uc29sZS5sb2cobXNnKTtcbiAgICB9KTtcblxuICAgIHNvY2tldC5vbignY3VycmVudFRlc3RRdWVzdGlvbicsIGZ1bmN0aW9uKHF1ZXN0aW9uKSB7XG4gICAgICBjb25zb2xlLmxvZyhxdWVzdGlvbik7XG4gICAgICAkc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xuICAgICAgICAkc2NvcGUudGltZSA9IHF1ZXN0aW9uLnRpbWU7XG4gICAgICAgICRzY29wZS50aW1lT3V0ID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5jdXJyZW50UXVlc3Rpb24gPSBxdWVzdGlvbjtcbiAgICAgICAgJHNjb3BlLmFuc3dlciA9IG51bGw7XG4gICAgICB9KTtcbiAgICAgIHZhciB0aW1lciA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS4kYXBwbHkoZnVuY3Rpb24oKXtcbiAgICAgICAgICAkc2NvcGUudGltZSAtLTtcbiAgICAgICAgfSk7XG4gICAgICB9LCAxMDAwKTtcblxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKTtcbiAgICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcbiAgICAgICAgICAkc2NvcGUudGltZU91dCA9IHRydWU7XG4gICAgICAgICAgJHNjb3BlLnRpbWUgPSBudWxsO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCEkc2NvcGUuc3R1ZGVudEFuc3dlcikge1xuICAgICAgICAgIHNvY2tldC5lbWl0KCdhbnN3ZXJzJywgJ251bGwnKTtcbiAgICAgICAgfVxuICAgICAgfSwgcXVlc3Rpb24udGltZSAqIDEwMDApO1xuICAgIH0pO1xuXG4gICAgc29ja2V0Lm9uKCdyZXN1bHQnLCBmdW5jdGlvbihtc2cpe1xuICAgICAgY29uc29sZS5sb2cobXNnKTtcbiAgICAgIGNvbnNvbGUubG9nKG1zZy50cnVlIC8gbXNnLnRvdGFsKTtcbiAgICB9KTtcbiAgICAkc2NvcGUuYWRkVGVhY2hlciA9IGZ1bmN0aW9uKHRlYWNoZXIpe1xuICAgICAgU3R1ZGVudFNlcnZpY2UuYWRkVGVhY2hlcih0ZWFjaGVyKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnN1Ym1pdEFuc3dlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgY29uc29sZS5sb2coJHNjb3BlLnN0dWRlbnRBbnN3ZXIpO1xuICAgICAgc29ja2V0LmVtaXQoJ2Fuc3dlcnMnLCAkc2NvcGUuY3VycmVudFF1ZXN0aW9uLmFuc3dlciA9PT0gJHNjb3BlLnN0dWRlbnRBbnN3ZXIpO1xuICAgIH07XG4gIH0pO1xuXG4gIGFwcC5jb250cm9sbGVyKCdUZWFjaGVyQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgVGVhY2hlclNlcnZpY2UsICRsb2NhdGlvbiwgJHN0YXRlKXtcbiAgICBzb2NrZXQub24oJ3Jlc3VsdCcsIGZ1bmN0aW9uKG1zZyl7XG4gICAgICBjb25zb2xlLmxvZyhtc2cpO1xuICAgICAgY29uc29sZS5sb2cobXNnLnRydWUgLyBtc2cudG90YWwpO1xuICAgIH0pO1xuXG4gICAgVGVhY2hlclNlcnZpY2UuYWxsUXVlc3Rpb25zKClcbiAgICAuc3VjY2VzcyhmdW5jdGlvbihhbGxRdWVzdGlvbil7XG4gICAgICBjb25zb2xlLmxvZyhhbGxRdWVzdGlvbik7XG4gICAgICAkc2NvcGUuYWxsUXVlc3Rpb24gPSBhbGxRdWVzdGlvbjtcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpe1xuICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9KTtcbiAgICAkc2NvcGUuYWRkU2V0ID0gZnVuY3Rpb24oKXtcbiAgICAgIFRlYWNoZXJTZXJ2aWNlLmFkZFNldCgkc2NvcGUubmV3U2V0TmFtZSk7XG4gICAgICAkc2NvcGUubmV3U2V0TmFtZSA9Jyc7XG4gICAgfTtcbiAgICAkc2NvcGUuZWRpdExpc3QgPSBmdW5jdGlvbihzZXQpIHtcbiAgICAgIFRlYWNoZXJTZXJ2aWNlLmN1cnJlbnRTZXQgPSBzZXQ7XG4gICAgICAkbG9jYXRpb24udXJsKCcvdGVhY2hlci9xdWVzdGlvbkxpc3QvJytzZXQuX2lkKTtcbiAgICB9O1xuICAgICRzY29wZS5kZWxldGVTZXQgPSBmdW5jdGlvbihzZXQpIHtcbiAgICAgIFRlYWNoZXJTZXJ2aWNlLmRlbGV0ZVNldChzZXQpO1xuICAgIH07XG4gIH0pO1xuICBhcHAuY29udHJvbGxlcignUXVlc3Rpb25DdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBUZWFjaGVyU2VydmljZSwgJGxvY2F0aW9uLCAkc3RhdGUsICRzdGF0ZVBhcmFtcyl7XG4gICAgVGVhY2hlclNlcnZpY2UuZ2V0Q3VycmVudFNldCgkc3RhdGVQYXJhbXMuc2V0SWQpXG4gICAgLnN1Y2Nlc3MoZnVuY3Rpb24oY3VycmVudFNldCl7XG4gICAgICBUZWFjaGVyU2VydmljZS5jdXJyZW50U2V0ID0gY3VycmVudFNldDtcbiAgICAgICRzY29wZS5jdXJyZW50U2V0ID0gY3VycmVudFNldDtcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpe1xuICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9KTtcbiAgICAkc2NvcGUuYWRkUXVlc3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgICAgIFRlYWNoZXJTZXJ2aWNlLmFkZFF1ZXN0aW9uKCRzY29wZS5uZXdRdWVzdGlvbik7XG4gICAgICAkc2NvcGUubmV3UXVlc3Rpb24gPSAnJztcbiAgICB9O1xuICAgICRzY29wZS5zdGFydFRlc3QgPSBmdW5jdGlvbihxdWVzdGlvbikge1xuICAgICAgc29ja2V0LmVtaXQoJ3N0YXJ0VGVzdCcsIHF1ZXN0aW9uKTtcbiAgICB9O1xuICAgICRzY29wZS5kZWxldGVRdWVzdGlvbiA9IGZ1bmN0aW9uKHF1ZXN0aW9uKXtcbiAgICAgIGNvbnNvbGUubG9nKHF1ZXN0aW9uKTtcbiAgICAgIGNvbnNvbGUubG9nKFRlYWNoZXJTZXJ2aWNlLmN1cnJlbnRTZXQpO1xuICAgICAgVGVhY2hlclNlcnZpY2UuZGVsZXRlUXVlc3Rpb24ocXVlc3Rpb24pO1xuICAgIH07XG4gIH0pO1xuICBhcHAuY29udHJvbGxlcignTWFpbkN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRodHRwKXtcbiAgICAkc2NvcGUucmVnaXN0ZXJVc2VyID0gZnVuY3Rpb24oKSB7XG4gICAgICAkaHR0cC5wb3N0KCdodHRwOi8vbG9jYWxob3N0OjMwMDAvcmVnaXN0ZXInLCB7dHlwZTogJHNjb3BlLnR5cGV9KVxuICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpe1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICB9KTtcbiAgICB9O1xuICB9KTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24oKXtcbiAgJ3VzZSBzdHJpY3QnO1xuICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2NsYXJpdHkuc2VydmljZScsIFtdKTtcbiAgYXBwLmNvbnN0YW50KCdDb25zdGFudCcsIHtcbiAgICB1cmw6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAvJ1xuICB9KTtcbiAgYXBwLnNlcnZpY2UoJ1RlYWNoZXJTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsICRzdGF0ZVBhcmFtcywgQ29uc3RhbnQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5jdXJyZW50U2V0ID0gbnVsbDtcbiAgICB0aGlzLmFkZFNldCA9IGZ1bmN0aW9uKG5ld1NldE5hbWUpe1xuICAgICAgJGh0dHAucG9zdChDb25zdGFudC51cmwgKyAndGVhY2hlci9zZXQnLCB7IHNldE5hbWU6IG5ld1NldE5hbWUgfSlcbiAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIH0pO1xuICAgIH07XG4gICAgdGhpcy5hZGRRdWVzdGlvbiA9IGZ1bmN0aW9uKG5ld1F1ZXN0aW9uKXtcbiAgICAgICRodHRwLnBvc3QoQ29uc3RhbnQudXJsICsgJ3RlYWNoZXIvcXVlc3Rpb24vJysgc2VsZi5jdXJyZW50U2V0Ll9pZCwgbmV3UXVlc3Rpb24pXG4gICAgICAuc3VjY2VzcyhmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycil7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICB9KTtcbiAgICB9O1xuICAgIHRoaXMuYWxsUXVlc3Rpb25zID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KENvbnN0YW50LnVybCArICd0ZWFjaGVyL2FsbFF1ZXN0aW9uJyk7XG4gICAgfTtcbiAgICB0aGlzLmRlbGV0ZVNldCA9IGZ1bmN0aW9uKHNldCkge1xuICAgICAgJGh0dHAuZGVsZXRlKENvbnN0YW50LnVybCArICd0ZWFjaGVyL3NldC8nKyBzZXQuX2lkKVxuICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIH0pO1xuICAgIH07XG4gICAgdGhpcy5nZXRDdXJyZW50U2V0ID0gZnVuY3Rpb24oc2V0SWQpIHtcbiAgICAgIHJldHVybiAkaHR0cC5nZXQoQ29uc3RhbnQudXJsICsgJ3RlYWNoZXIvc2V0Lycrc2V0SWQpO1xuICAgIH07XG4gICAgdGhpcy5kZWxldGVRdWVzdGlvbiA9IGZ1bmN0aW9uKHF1ZXN0aW9uKXtcbiAgICAgICRodHRwLmRlbGV0ZShDb25zdGFudC51cmwgKyAndGVhY2hlci9xdWVzdGlvbi8nKyBzZWxmLmN1cnJlbnRTZXQuX2lkICsgJy8nKyBxdWVzdGlvbi5faWQpXG4gICAgICAuc3VjY2VzcyhmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpe1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICB9KTtcbiAgYXBwLnNlcnZpY2UoJ1N0dWRlbnRTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIENvbnN0YW50KSB7XG4gICAgdGhpcy5hbGxUZWFjaGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KENvbnN0YW50LnVybCArICd0ZWFjaGVycycpO1xuICAgIH07XG4gICAgdGhpcy5hZGRUZWFjaGVyID0gZnVuY3Rpb24odGVhY2hlcil7XG4gICAgICAkaHR0cC5wYXRjaChDb25zdGFudC51cmwgKyAnYWRkdGVhY2hlcicsIHRlYWNoZXIpXG4gICAgICAuc3VjY2VzcyhmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycil7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICB9KTtcbiAgICAgIGNvbnNvbGUubG9nKHRlYWNoZXIpO1xuICAgIH07XG4gIH0pO1xufSkoKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==