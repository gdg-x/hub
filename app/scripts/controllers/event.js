'use strict';

angular.module('gdgxHubApp')
  .controller('EventCtrl', function ($scope, $http, $routeParams) {
  	$scope.event = { geo: { latitude: 0, longitude: 0 } };
  	$http.get("/api/v1/events/"+$routeParams['eventId']).success(function(data, status, headers, config) {
    	data.geo.latitude = data.geo.lat;
    	data.geo.longitude = data.geo.lng;
    	delete data.geo.lat;
    	delete data.geo.lng;
    	$scope.event = data;
  	});
  })
  .controller('EventDetailCtrl', function ($scope, $http, $routeParams) {

  	$http.get("/api/v1/events/"+$routeParams['eventId']).success(function(data, status, headers, config) {
    	if(data.geo) {
	    	data.geo.latitude = data.geo.lat;
	    	data.geo.longitude = data.geo.lng;
	    	delete data.geo.lat;
	    	delete data.geo.lng;
    	}
    	$scope.event = data;
  	});
  });
