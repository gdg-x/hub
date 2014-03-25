'use strict';

angular.module('gdgxHubApp')
  .controller('DashboardCtrl', function ($scope, $http) {

    $scope.fetchChapterEvents = function() {
      $http.get('/api/v1/chapters/'+$scope.user.chapters[0].id+'/events').success(function(data) {
        $scope.events = data.items;
      });
    }
    
  	if($scope.user.organizer) {
  		$scope.fetchChapterEvents();
  	}

  	$scope.$watch("user.organizer", function(newValue, oldValue) {
  		if(newValue) $scope.fetchChapterEvents();
  	});

  })
  .controller('EventSeriesCtrl', function($scope, $http){
  	
  	$scope.addPermissions = function(tag, folderId){
  		$http.get('/api/v1/events/tag/' + tag).success(function (eventData){
  			angular.forEach(eventData.items, function(value, key){
       		chapterCalls.push($http.get('/api/v1/chapter/' + value.chapter))
       		  			});
	      $q.all(chapterCalls).then(function(chapters){      	
   	    	angular.forEach(chapters, function(value, key){
      	 		angular.forEach(value.organizers, function(organizer, index){
       					// call the drive api
       			})
       		})
       	});     			      
      });
  	}  
  });