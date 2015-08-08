(function() {
  'use strict';
  var app = angular.module('clarity.controller', []);
  var socket = io.connect('http://localhost:3000');
  app.controller('StudentCtrl', function($scope, TeacherService, StudentService, $location) {
    StudentService.allTeacher()
    .success(function(teachers) {
      $scope.teachers = teachers;
    }).catch(function(err) {
      console.log(err);
    });

    function bindMyTeacher() {
      StudentService.myTeacher()
      .success(function(teachers) {
        console.log(teachers);
        $scope.myTeachers = teachers;
      }).catch(function(err) {
        console.log(err);
      });
    }
    bindMyTeacher();
    socket.on('users count', function(msg) {
      console.log(msg);
    });

    $scope.addTeacher = function(teacher) {
      StudentService.addTeacher(teacher)
      .success(function(response){
        bindMyTeacher();
      }).catch(function(err){
        console.log(err);
      });
    };
    $scope.enterRoom = function(teacher) {
      $location.url('/student/room/' + teacher._id);
    };
  });
  app.controller('RoomCtrl', function($scope, TeacherService, StudentService, $location, $stateParams) {

    $scope.sendMessage = function () {
      socket.emit('chat message', $scope.message, $stateParams.roomId);
    };
    socket.on('message', function(message){
      console.log(message);
    });


    socket.emit('join', $stateParams.roomId);
    socket.on('user in room', function(numberOfUser){
      $scope.$apply(function(){
        console.log('number of user', numberOfUser);
        $scope.userCount = numberOfUser;
      });
    });

    function bindPoint() {
      StudentService.getPoint()
      .success(function(response){
        $scope.pointsData = response;
      }).catch(function(err){
        console.log(err);
      });
    }
    bindPoint();


    $scope.submitAnswer = function() {
      var result = $scope.currentQuestion.answer === $scope.studentAnswer;
      socket.emit('answers', result, $scope.studentAnswer, $stateParams.roomId);
      $scope.timeOut = true;
      if (result){
        StudentService.postPoint()
        .success(function(response){
          bindPoint();
        }).catch(function(err){
          console.log(err);
        });
      }
    };

    socket.on('currentTestQuestion', function(question) {
      $scope.$apply(function() {
        $scope.time = question.time;
        $scope.timeOut = false;
        $scope.currentQuestion = question;
        $scope.answer = null;
      });
      var timer = setInterval(function() {
        $scope.$apply(function() {
          $scope.time--;
        });
      }, 1000);

      setTimeout(function() {
        clearInterval(timer);
        $scope.$apply(function() {
          $scope.timeOut = true;
          $scope.time = null;
        });
        if (!$scope.studentAnswer) {
          socket.emit('answers', 'null', $stateParams.roomId);
        }
      }, question.time * 1000);
    });

    socket.on('result', function(msg) {
      console.log(msg);
      console.log("correct ratio", msg.true / msg.total);

      Highcharts.createElement('link', {
      href: '//fonts.googleapis.com/css?family=Unica+One',
      rel: 'stylesheet',
      type: 'text/css'
      }, null, document.getElementsByTagName('head')[0]);

      Highcharts.theme = {
      colors: ["#2b908f", "#90ee7e", "#f45b5b", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
        "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
      chart: {
        backgroundColor: {
           linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
           stops: [
              [0, '#2a2a2b'],
              [1, '#3e3e40']
           ]
        },
        style: {
           fontFamily: "'Unica One', sans-serif"
        },
        plotBorderColor: '#606063'
      },
      title: {
        style: {
           color: '#E0E0E3',
           textTransform: 'uppercase',
           fontSize: '20px'
        }
      },
      subtitle: {
        style: {
           color: '#E0E0E3',
           textTransform: 'uppercase'
        }
      },
      xAxis: {
        gridLineColor: '#707073',
        labels: {
           style: {
              color: '#E0E0E3'
           }
        },
        lineColor: '#707073',
        minorGridLineColor: '#505053',
        tickColor: '#707073',
        title: {
           style: {
              color: '#A0A0A3'

           }
        }
      },
      yAxis: {
        gridLineColor: '#707073',
        labels: {
           style: {
              color: '#E0E0E3'
           }
        },
        lineColor: '#707073',
        minorGridLineColor: '#505053',
        tickColor: '#707073',
        tickWidth: 1,
        title: {
           style: {
              color: '#A0A0A3'
           }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        style: {
           color: '#F0F0F0'
        }
      },
      plotOptions: {
        series: {
           dataLabels: {
              color: '#B0B0B3'
           },
           marker: {
              lineColor: '#333'
           }
        },
        boxplot: {
           fillColor: '#505053'
        },
        candlestick: {
           lineColor: 'white'
        },
        errorbar: {
           color: 'white'
        }
      },
      legend: {
        itemStyle: {
           color: '#E0E0E3'
        },
        itemHoverStyle: {
           color: '#FFF'
        },
        itemHiddenStyle: {
           color: '#606063'
        }
      },
      credits: {
        style: {
           color: '#666'
        }
      },
      labels: {
        style: {
           color: '#707073'
        }
      },

      drilldown: {
        activeAxisLabelStyle: {
           color: '#F0F0F3'
        },
        activeDataLabelStyle: {
           color: '#F0F0F3'
        }
      },

      navigation: {
        buttonOptions: {
           symbolStroke: '#DDDDDD',
           theme: {
              fill: '#505053'
           }
        }
      },

      // scroll charts
      rangeSelector: {
        buttonTheme: {
           fill: '#505053',
           stroke: '#000000',
           style: {
              color: '#CCC'
           },
           states: {
              hover: {
                 fill: '#707073',
                 stroke: '#000000',
                 style: {
                    color: 'white'
                 }
              },
              select: {
                 fill: '#000003',
                 stroke: '#000000',
                 style: {
                    color: 'white'
                 }
              }
           }
        },
        inputBoxBorderColor: '#505053',
        inputStyle: {
           backgroundColor: '#333',
           color: 'silver'
        },
        labelStyle: {
           color: 'silver'
        }
      },

      navigator: {
        handles: {
           backgroundColor: '#666',
           borderColor: '#AAA'
        },
        outlineColor: '#CCC',
        maskFill: 'rgba(255,255,255,0.1)',
        series: {
           color: '#7798BF',
           lineColor: '#A6C7ED'
        },
        xAxis: {
           gridLineColor: '#505053'
        }
      },

      scrollbar: {
        barBackgroundColor: '#808083',
        barBorderColor: '#808083',
        buttonArrowColor: '#CCC',
        buttonBackgroundColor: '#606063',
        buttonBorderColor: '#606063',
        rifleColor: '#FFF',
        trackBackgroundColor: '#404043',
        trackBorderColor: '#404043'
      },

      // special colors for some of the
      legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
      background2: '#505053',
      dataLabelsColor: '#B0B0B3',
      textColor: '#C0C0C0',
      contrastTextColor: '#F0F0F3',
      maskColor: 'rgba(255,255,255,0.3)'
      };

      // Apply the theme
      Highcharts.setOptions(Highcharts.theme);



      $(function() {
        $('#container').highcharts({
          chart: {
            type: 'column'
          },
          title: {
            text: 'Multiple Choice Selection'
          },
          subtitle: {
            text: ''
          },
          xAxis: {
            categories: [
              'A', 'B', 'C', 'D', 'Null'
            ],
            crosshair: true
          },
          yAxis: {
            min: 0,
            title: {
              text: 'Rainfall (mm)'
            }
          },
          tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
              '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
          },
          plotOptions: {
            column: {
              pointPadding: 0.2,
              borderWidth: 0
            }
          },
          series: [{
            data: [msg.A, msg.B, msg.C, msg.D, msg.null]
          }]
        });
        $('#container2').highcharts({
          chart: {
            type: 'pie',
            options3d: {
              enabled: true,
              alpha: 45,
              beta: 0
            }
          },
          title: {
            text: 'Classroom Results'
          },
          tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
          },
          plotOptions: {
            pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              depth: 35,
              dataLabels: {
                enabled: true,
                format: '{point.name}'
              }
            }
          },
          series: [{
            type: 'pie',
            name: 'Browser share',
            data: [
              ['false', msg.false], {
                name: 'true',
                y: msg.true,
                sliced: true,
                selected: true
              },
              ['null', msg.null],
            ]
          }]
        });
      });
    });
  });

  app.controller('TeacherCtrl', function($scope, TeacherService, $location, $state) {
    socket.on('result', function(msg) {
      console.log(msg);
      console.log(msg.true / msg.total);
    });
    function bindSet() {
      TeacherService.allQuestions()
        .success(function(allQuestion) {
          console.log(allQuestion);
          $scope.allQuestion = allQuestion;
        }).catch(function(err) {
          console.log(err);
        });
    }
    bindSet();

    $scope.addSet = function() {
      TeacherService.addSet($scope.newSetName)
      .success(function(response){
        bindSet();
        $scope.newSetName = '';
        $('#setModal').modal('hide');
      }).catch(function(err){
        console.log(err);
      });
    };
    $scope.linkToList = function(set) {
      $location.url('/teacher/questionList/' + set._id);
    };
    $scope.deleteSet = function(set) {
      TeacherService.deleteSet(set);
      $state.reload();
    };
  });
  app.controller('QuestionListCtrl', function($scope, TeacherService, $location, $stateParams, $state) {




    function bindCurrentSet() {
      TeacherService.getCurrentSet($stateParams.setId)
        .success(function(currentSet) {
          $scope.currentSet = currentSet;

          //chat message
          $scope.sendMessage = function () {
            socket.emit('chat message', $scope.message, currentSet.createdBy);
          };
          socket.on('message', function(message){
            console.log(message);
          });
          //end of chat message

          socket.emit('join', currentSet.createdBy);
        }).catch(function(err) {
          console.log(err);
        });
    }
    bindCurrentSet();
    socket.on('user in room', function(numberOfUser){
      $scope.$apply(function() {
        $scope.userCount = numberOfUser;
      });
    });
    $scope.addQuestion = function() {
      TeacherService.addQuestion($scope.newQuestion)
      .success(function(response){
        bindCurrentSet();
        $scope.newQuestion = '';
        $('#questionModal').modal('hide');
      }).catch(function(err){
        console.log(err);
      });
    };
    $scope.startTest = function(question) {
      var roomId = $scope.currentSet.createdBy;
      socket.emit('startTest', question, roomId);
    };
    $scope.linkToQuestion = function(question) {
      $location.url('teacher/'+ $stateParams.setId + '/question/' + question._id);
    };
  });
  app.controller('QuestionCtrl', function(TeacherService, $scope, $location, $stateParams) {
    function bindQuestion() {
      TeacherService.currentQuestion($stateParams.questionId)
      .success(function(response){
        $scope.currentQuestion = response;
      }).catch(function(err){
        console.log(err);
      });
    }
    bindQuestion();

    $scope.deleteQuestion = function() {
      TeacherService.deleteQuestion($scope.currentQuestion);
      $location.url('teacher/questionList/'+$stateParams.setId);
    };
    $scope.editQuestion = function() {
      TeacherService.editQuestion($scope.editedQuestion)
      .success(function(response){
        bindQuestion();
        $('#editQuestion').modal('hide');
        $scope.editedQuestion = '';
      }).catch(function(err){
        console.log(err);
      });
    };
  });
  app.controller('MainCtrl', function($scope, StudentService) {
    $scope.registerUser = function() {
      StudentService.registerUser($scope.type);
    };
  });
})();
