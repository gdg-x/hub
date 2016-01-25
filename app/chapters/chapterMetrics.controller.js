'use strict';

angular.module('gdgxHubApp')
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
  });
