'use strict';

angular.module('gdgxHubApp')
  .controller('EventCtrl', function ($scope, $http, $routeParams, $location) {

    $scope.alertOnEventClick = function( event, allDay, jsEvent, view ){
      $scope.$apply(function() {
        $location.path( "/events/"+event.id );
      });
    };

    $scope.allCalendarConfig = {
      timeFormat: {
        '': "h(:mm)t",
        "month": "h(:mm)t",
        agenda: "h:mm{ - h:mm}"
      },
      eventClick: $scope.alertOnEventClick
    };

    $scope.events = function (start, end, callback) {
      $http.get("/api/v1/events/"+start.getTime()+"/"+end.getTime()+"?perpage=400").success(function(resp) {
        var events = [];
        var data = resp.items;

        for(var i = 0; i < data.length; i++) {
          events.push({
            title: data[i].title,
            id: data[i]._id,
            start: new Date(data[i].start),
            end: new Date(data[i].end),
            allDay: data[i].allDay
          });
        }

        callback(events);
      });
    };

    $scope.changeCalendarView = function(view,calendar) {
      calendar.fullCalendar('changeView',view);
    };

    $scope.eventSource = [ $scope.events ];
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

      $http.get("/api/v1/chapters/"+$scope.event.chapter).success(function(data, status, headers, config) {
        if(data.geo) {
          data.geo.latitude = data.geo.lat;
          data.geo.longitude = data.geo.lng;
          delete data.geo.lat;
          delete data.geo.lng;
        }
        $scope.chapter = data;
      });
  	});
  });
