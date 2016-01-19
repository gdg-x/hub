'use strict';

angular.module('gdgxHubApp', ['ngCookies', 'ngResource', 'ngSanitize', 'ngRoute', 'd3', 'moment-timezone',
  'googlechart', 'ui.calendar', 'ui.bootstrap', 'uiGmapgoogle-maps', 'gdgxHubApp.directives.gplus',
  'gdgxHubApp.directives.metrics', 'gdgxHubApp.directives.d3', 'gdgxHubApp.directives.moment', 'directive.g+signin'
])
  .run(function ($rootScope, $location, $http, $window, $log, Utilities, config) {
    $rootScope.user = {
      authResult: undefined,
      auth: false
    };

    $rootScope.toggleMenu = function () {
      if ($rootScope.menuToggle) {
        $rootScope.menuToggle = '';
      } else {
        $rootScope.menuToggle = 'navbar_open';
      }
    };

    $rootScope.supportsGeo = $window.navigator.geolocation !== undefined;

    if ($rootScope.supportsGeo) {
      $window.navigator.geolocation.getCurrentPosition(function (position) {
        $rootScope.$apply(function () {
          $rootScope.position = position;
        });
      }, function (error) {
        log.info(error);
      });
    }

    $rootScope.$on('$routeChangeSuccess', function () {
      ga('send', 'pageview', {'page': $location.path()});
    });

    $rootScope.$on('event:google-plus-signin-success', function (event, authResult) {
      // Send login to server or save into cookie
      Utilities.decodeJwt(authResult.id_token, function (claims) { // jshint ignore:line
        if (authResult.status.signed_in) { // jshint ignore:line
          $http.post('/signin', {code: authResult.code}).success(function (data) {

            if (data.user === claims.sub) {
              $http.get('https://www.googleapis.com/plus/v1/people/me?fields=image&key=' + config.GOOGLE_API_KEY, {
                headers: {'Authorization': 'Bearer ' + authResult.access_token} // jshint ignore:line
              }).success(function (additional) { // jshint ignore:line
                $rootScope.user = {
                  auth: authResult.status.signed_in, // jshint ignore:line
                  authResult: authResult,
                  image: additional.image.url.replace('sz=50', 'sz=32'),
                  email: claims.email,
                  userId: claims.sub,
                  chapters: data.chapters,
                  organizer: (data.chapters.length > 0)
                };
                $rootScope.$broadcast('authenticated');
              });
            } else {
              $window.alert('ID Missmatch');
            }
          });
        }
      });
    });

    $rootScope.$on('event:google-plus-signin-failure', function (event, authResult) {
      // Auth failure or signout detected
      $log.info('Auth failed');
      $log.debug(authResult.error);
      $rootScope.$apply(function () {
        $rootScope.user = {
          authResult: authResult,
          auth: false
        };
      });
    });
  });
