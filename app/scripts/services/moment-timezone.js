'use strict';

angular.module('moment-timezone', [])
  .service('MomentTimezone', ['$http', function ($http) {
  	var promise = $http.get("/bower_components/moment-timezone/moment-timezone.json").success(function(resp) {
        moment.tz.add(resp);
    });
    return {
    	promise: promise
    }
  }]);