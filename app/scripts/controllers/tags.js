'use strict';

angular.module('gdgxHubApp')
  .controller('TagManagementCtrl', function ($scope, $http, $routeParams) {
    $http.get('/api/v1/tags').success(function(tagData) {
      $scope.tags = tagData.items;
    });
    $http.get('/api/v1/tags/' + $routeParams('tag')).success(function(tagData) {
          $scope.tag = tagData[0];
    });
  });