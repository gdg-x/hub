'use strict';

angular.module('gdgxHubApp')
  .controller('EventDetailCtrl', function ($scope, $http, $routeParams, config) {

    $http.get('/api/v1/events/' + $routeParams.eventId).success(function (data) {
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
            id: $routeParams.eventId,
            geo: {
              latitude: data.geo.latitude, longitude: data.geo.longitude
            }
          }
        ];
        delete data.geo.lat;
        delete data.geo.lng;
      }
      $scope.event = data;

      $http.get('https://www.googleapis.com/plus/v1/people/' + $scope.event.chapter +
      '?fields=image&key=' + config.GOOGLE_API_KEY)
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
  });
