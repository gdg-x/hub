'use strict';

angular.module('gdgxHubApp')
  .controller('EventsCtrl', function ($scope, $http, $routeParams, $location, uiCalendarConfig) {

    $scope.alertOnEventClick = function (event) {
      $location.path('/events/' + event.id);
    };

    $scope.allCalendarConfig = {
      timeFormat: {
        '': 'h(:mm)t',
        'month': 'h(:mm)t',
        agenda: 'h:mm{ - h:mm}'
      },
      eventClick: $scope.alertOnEventClick
    };

    $scope.events = function (start, end, timezone, callback) {
      $http.get('/api/v1/events/' + start.toDate().getTime() + '/' + end.toDate().getTime() +
      '?perpage=1000&fields=title,chapter,start,end,allDay')
        .success(function (resp) {
          var events = [];
          var data = resp.items;

          for (var i = 0; i < data.length; i++) {
            events.push({
              title: data[i].title,
              id: data[i]._id,
              start: new Date(data[i].start),
              end: new Date(data[i].end),
              allDay: data[i].allDay
            });
          }

          if (callback) {
            callback(events);
          }
        });
    };

    $scope.changeCalendarView = function (view, calendar) {
      uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
    };

    $scope.eventSource = [$scope.events];
  });
