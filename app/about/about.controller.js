'use strict';

angular.module('gdgxHubApp')
	.controller('AboutCtrl', function ($scope, $http, $filter) {
		$http.get('https://api.github.com/repos/gdg-x/hub/contributors').success(function(data) {
      // Only show when contributions is > 1 to filter out things like the Gitter badger.
      $scope.contributors = $filter('filter')(data, function (value) {
        return value.contributions > 1;
      });
    });
	});
