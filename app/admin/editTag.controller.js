'use strict';

angular.module('gdgxHubApp').controller('EditTagCtrl', function($http, $routeParams) {
  var vm = this;
  vm.showSuccess = false;
  vm.showError = false;

  var tagId = $routeParams.tagId;
  vm.tag = {};
  $http.get('/api/v1/tags/' + tagId).then(function(response) {
    vm.tag = angular.copy(response.data);
  }).catch(function(error) {
    console.log('Invalid tag: ' + tagId);
    vm.errorText = 'Failure looking up tag \"' + tagId + '\" - ' + error.statusText;
    vm.errorDuration = 300000;
    vm.showError = true;
    console.log(error);
  });

  vm.update = function(tag) {
    $http.put('/api/v1/tags/' + tagId, tag).then(function() {
      console.log('Tag saved!');
      vm.showSuccess = true;
    }).catch(function(error) {
      console.log('Invalid tag: ' + tagId);
      vm.errorText = 'Update Failed: ' + error.statusText;
      vm.errorDuration = 15000;
      vm.showError = true;
      console.log(error);
    });
  };
});
