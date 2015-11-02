'use strict';

angular.module('gdgxHubApp')
  .controller('ChapterCountryCtrl', function ($scope, $http, $routeParams) {
    $scope.country = $routeParams.country;
    $scope.country_zoom = 10; // jshint ignore:line
    $http.get('/api/v1/chapters/country/' + $routeParams.country + '?sort=name')
      .success(function (resp) {

        var data = resp.items;
        for (var i = 0; i < data.length; i++) {
          if (data[i].geo) {
            data[i].geo.latitude = data[i].geo.lat;
            data[i].geo.longitude = data[i].geo.lng;
            data[i].geo.zoom = 10;
            delete data[i].geo.lng;
            delete data[i].geo.lat;
          }
        }

        $scope.country_geo = {latitude: data[0].geo.latitude, longitude: data[0].geo.longitude}; // jshint ignore:line
        $scope.chapters = data;
      });
  })
  .controller('ChapterMetricsCtrl', function ($scope, $http, $routeParams, config) {

    $scope.month = (moment().months() + 1);
    $scope.year = moment().year();
    $scope.chapterId = $routeParams.chapterId;

    $http.get('/api/v1/chapters/' + $routeParams.chapterId).success(function (data) {
      if (data.geo) {
        data.geo.latitude = data.geo.lat;
        data.geo.longitude = data.geo.lng;
        data.geo.zoom = 10;
        delete data.geo.lng;
        delete data.geo.lat;
      }
      $scope.map_center = { // jshint ignore:line
        latitude: data.geo.latitude,
        longitude: data.geo.longitude
      };
      $scope.chapter = data;
    });

    $http.get('https://www.googleapis.com/plus/v1/people/' + $routeParams.chapterId +
    '?fields=aboutMe,image&key=' + config.GOOGLE_API_KEY)
      .success(function (data) {
        $scope.about = data.aboutMe;
        $scope.image = data.image.url.replace('sz=50', 'sz=70');
      });
  })
  .controller('ChapterDetailCtrl', function ($scope, $http, $routeParams, $location, uiCalendarConfig, config) {
    $http.get('/api/v1/chapters/' + $routeParams.chapterId).success(function (data) {
      if (data.geo) {
        data.geo.latitude = data.geo.lat;
        data.geo.longitude = data.geo.lng;
        data.geo.zoom = 10;
        delete data.geo.lng;
        delete data.geo.lat;
      }
      $scope.map_center = { // jshint ignore:line
        latitude: data.geo.latitude,
        longitude: data.geo.longitude
      };
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
