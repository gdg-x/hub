'use strict';

angular.module('gdgxHubApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'directive.g+signin'
])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/main',
        controller: 'MainCtrl'
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