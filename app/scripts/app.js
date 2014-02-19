'use strict';

angular.module('gdgxHubApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'd3',
  'googlechart',
  'ui.calendar',
  'google-maps',
  'gdgxHubApp.directives.gplus',
  'gdgxHubApp.directives.d3',
  'directive.g+signin',
])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/main',
        controller: 'MainCtrl'
      })
      .when('/chapters', {
        templateUrl: 'partials/chapters',
        controller: 'ChapterCtrl'
      })
      .when('/chapters/country/:country', {
        templateUrl: 'partials/chapter_country',
        controller: 'ChapterCountryCtrl'
      })
      .when('/chapters/:chapterId', {
        templateUrl: 'partials/chapter',
        controller: 'ChapterDetailCtrl'
      })
      .when('/events', {
        templateUrl: 'partials/events',
        controller: 'EventCtrl'
      })
      .when('/events/:eventId', {
        templateUrl: 'partials/event',
        controller: 'EventDetailCtrl'
      })
      .when('/developers/api', {
        templateUrl: 'partials/api',
        controller: 'ApiCtrl'
      })
      .when('/statistics', {
        templateUrl: 'partials/gdg_stats',
        controller: 'GdgStatsCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
      
    $locationProvider.html5Mode(true);
  })
  .run(function ($rootScope, $location, $http, Utilities) {
    $rootScope.auth = undefined;
    $rootScope.$on('event:google-plus-signin-success', function (event,authResult) {
      // Send login to server or save into cookie   $rootScope.$apply(function() {

      Utilities.decodeJwt(authResult['id_token'], function(claims) {
        if(authResult['status']['signed_in']) {
          $http.post('/signin', { code: authResult['code'] }).success(function() {
              $rootScope.auth = authResult['status']['signed_in'];
              $rootScope.authResult = authResult;
              $rootScope.email = claims['email'];
              $rootScope.userId = claims['sub'];
              $rootScope.$broadcast("authenticated");
          });
        }
      });
    });

    $rootScope.$on('event:google-plus-signin-failure', function (event,authResult) {
      // Auth failure or signout detected
      $rootScope.$apply(function() {
        $rootScope.authResult = undefined;
        $rootScope.auth = false;
      });
    });
  });