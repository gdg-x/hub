'use strict';

angular.module('gdgxHubApp')
  .controller('ChapterDetailCtrl', function ($scope, $http, $routeParams, $location, uiCalendarConfig, config) {
    $http.get('/api/v1/chapters/' + $routeParams.chapterId).success(function (data) {
      if (data.geo) {
        data.geo.latitude = data.geo.lat;
        data.geo.longitude = data.geo.lng;
        data.map = {
          options: {
            zoom: 11,
            center: {
              latitude: data.geo.latitude,
              longitude: data.geo.longitude
            }
          }
        };
        $scope.markers = [
          {
            id: $routeParams.chapterId,
            geo: {
              latitude: data.geo.latitude,
              longitude: data.geo.longitude
            }
          }
        ];
        delete data.geo.lng;
        delete data.geo.lat;
      }
      $scope.chapter = data;
    });

    $http.get('https://www.googleapis.com/plus/v1/people/' + $routeParams.chapterId +
        '?fields=aboutMe,image&key=' + config.GOOGLE_API_KEY)
      .success(function (data) {
        $scope.about = data.aboutMe;
        $scope.image = data.image.url.replace('sz=50', 'sz=70');
      });

    $scope.chapterCalendar = {};

    $scope.alertOnEventClick = function (event) {
      $location.path('/events/' + event.id);
    };

    $scope.chapterCalendarConfig = {
      timeFormat: {
        '': 'h(:mm)t',
        'month': 'h(:mm)t',
        agenda: 'h:mm{ - h:mm}'
      },
      eventClick: $scope.alertOnEventClick
    };

    $scope.changeCalendarView = function (view, calendar) {
      uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
    };

    $scope.events = function (start, end, timezone, callback) {
      $http.get('/api/v1/chapters/' + $routeParams.chapterId + '/events/' +
          start.toDate().getTime() + '/' + end.toDate().getTime())
        .success(function (resp) {
          var events = [];
          var data = resp.items;

          for (var i = 0; i < data.length; i++) {
            events.push({
              title: data[i].title,
              start: data[i].start,
              id: data[i]._id,
              end: data[i].end,
              allDay: data[i].allDay
            });
          }

          if (callback) {
            callback(events);
          }
        });
    };

    $scope.eventSource = [$scope.events];
  });
