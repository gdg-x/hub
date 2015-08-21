'use strict';

angular.module('gdgxHubApp')
  .controller('EventCtrl', function ($scope, $http, $routeParams, $location) {

    $scope.alertOnEventClick = function (event) {
      $scope.$apply(function () {
        $location.path('/events/' + event.id);
      });
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
      calendar.fullCalendar('changeView', view);
    };

    $scope.eventSource = [$scope.events];
  })
  .controller('EventDetailCtrl', function ($scope, $http, $routeParams) {

    $http.get('/api/v1/events/' + $routeParams.eventId).success(function (data) {
      if (data.geo) {
        data.geo.latitude = data.geo.lat;
        data.geo.longitude = data.geo.lng;
        data.geo.zoom = 11;
        data.geo.center = {
          latitude: data.geo.latitude,
          longitude: data.geo.longitude
        };
        delete data.geo.lat;
        delete data.geo.lng;
      }
      $scope.event = data;

      $http.get('https://www.googleapis.com/plus/v1/people/' + $scope.event.chapter +
      '?fields=image&key=AIzaSyD7v04m_bTu-rcWtuaN3fTP9NBmjhB7lXg')
        .success(function (data) {
          $scope.image = data.image.url.replace('sz=50', 'sz=70');
        });

      $http.get('/api/v1/chapters/' + $scope.event.chapter).success(function (data) {
        if (data.geo) {
          data.geo.latitude = data.geo.lat;
          data.geo.longitude = data.geo.lng;
          delete data.geo.lat;
          delete data.geo.lng;
        }
        $scope.chapter = data;
      });
    });
  })
  .controller('EventsHeatmapCtrl', function ($scope, $http, $routeParams) {
    $scope.year = parseInt($routeParams.year);
    $scope.month = parseInt($routeParams.month);
    $scope.map = {
      zoom: 2,
      ready: 0,
      control: {},
      center: {
        latitude: 19.988635,
        longitude: -9.987259
      }
    };

    $scope.data = {};
    $http.get('/api/v1/events/year/' + $scope.year + '/' + $scope.month + '?perpage=999').success(function (data) {
      var heatData = {
        max: 4,
        data: []
      };
      for (var i = 0; i < data.items.length; i++) {
        var item = data.items[i];

        if (item.geo) {
          heatData.data.push({
            lat: item.geo.lat,
            lng: item.geo.lng,
            count: 1
          });
        }
      }
      $scope.heatData = heatData;
      $scope.map.ready++;
    });

    $scope.$watch('map.control', function (newValue) {
      if (newValue) {
        $scope.map.ready++;
      }
    });

    $scope.$watch('map.ready', function (newValue) {
      if (newValue > 1) {
        $scope.gmap = $scope.map.control.getGMap();
        var heatmap = new HeatmapOverlay($scope.map.control.getGMap(), {
          'radius': 20,
          'visible': true,
          'opacity': 60
        });

        google.maps.event.addListenerOnce($scope.map.control.getGMap(), 'idle', function () {
          // this is important, because if you set the data set too early, the latlng/pixel projection doesn't work
          heatmap.setDataSet($scope.heatData);
        });
      }
    });
  });
