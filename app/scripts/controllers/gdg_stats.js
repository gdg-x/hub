'use strict';

angular.module('gdgxHubApp')
  .controller('GdgStatsCtrl', function ($scope, $http) {

	$scope.upcomingTagsChart = {
		"type": "PieChart",
    "displayed": true,
		options: {
      "pieHole": 0.4,
      "chartArea": {
        top: 8,
        height: "90%"
      }
    },
		data: {
			"cols": [
        		{id: "t", label: "Tags", type: "string"},
        		{id: "s", label: "Occurences", type: "number"}
    		]
		}
	}

  $scope.pastTagsChart = {
    "type": "PieChart",
    "displayed": true,
    options: {
      "pieHole": 0.4,
      "chartArea": {
        top: 8,
        height: "90%"
      }
    },
    data: {
      "cols": [
            {id: "t", label: "Tags", type: "string"},
            {id: "s", label: "Occurences", type: "number"}
        ]
    }
  }

  $http.get("/api/v1/events?perpage=5&sort=start").success(function(data, status, headers, config) {
    $scope.nextEvents = data.items;
  });

  $http.get("/api/v1/events/stats").success(function(data, status, headers, config) {

      $scope.upcomingHours = Math.round(data["total_upcoming_events_duration_ms"] / 1000 / 60 / 60, 0);
      $scope.totalHours = Math.round(data["total_events_duration_ms"] / 1000 / 60 / 60, 0);

  		var rows = [];
  		for(var prop in data['upcoming_top_tags']) {
  			rows.push({c: [
            	{v: prop},
            	{v: data['upcoming_top_tags'][prop]},
        	]});
  		}
  		$scope.upcomingTagsChart.data['rows'] = rows;

      rows = [];
      for(var prop in data['alltime_top_tags']) {
        rows.push({c: [
              {v: prop},
              {v: data['alltime_top_tags'][prop]},
          ]});
      }
      $scope.pastTagsChart.data['rows'] = rows;
  });

});
