'use strict';

angular.module('gdgxHubApp')
  .controller('DashboardCtrl', function ($scope, $http) {

    $scope.fetchChapterEvents = function () {
      $http.get('/api/v1/chapters/' + $scope.user.chapters[0].id + '/events').success(function (data) {
        $scope.events = data.items;
      });
    };

    if ($scope.user.organizer) {
      $scope.fetchChapterEvents();
    }

    $scope.$watch('user.organizer', function (newValue) {
      if (newValue) {
        $scope.fetchChapterEvents();
      }
    });
  });
