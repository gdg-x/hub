'use strict';

angular.module('gdgxHubApp').controller('EditTagCtrl', function($scope, $http, $routeParams) {
  var tagId = $routeParams.tagId;
  $scope.tag = {};
  $http.get('/api/v1/tags/' + tagId).then(function(response) {
    $scope.tag = angular.copy(response.data);
  }).catch(function(error) {
    console.log('Invalid tag: ' + tagId);
    console.log(error);
  });

  $scope.update = function(tag) {
    $http.put('/api/v1/tags/' + tagId, tag).then(function() {
      console.log('tag saved');
    }).catch(function(error) {
      console.log('Invalid tag: ' + tagId);
      console.log(error);
    });
  };
});
