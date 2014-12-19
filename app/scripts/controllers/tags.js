'use strict';

angular.module('gdgxHubApp')
  .factory('Tag', function($resource) {
    return $resource('/api/v1/tags/:id');
  })
  .controller('TagManagementCtrl', function ($scope, $http, $routeParams) {
    $http.get('/api/v1/tags').success(function(tagData) {
      $scope.tags = tagData.items;
    });
    $http.get('/api/v1/tags/' + $routeParams('tag')).success(function(tagData) {
          $scope.tag = tagData[0];
    });

    $scope.update(tag) = function(tag){
      tag.$save();
    }
  });