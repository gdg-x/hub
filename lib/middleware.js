'use strict';

var passport = require('passport');

/**
 * Custom middleware used by the application
 */
module.exports = {
  auth: function(options) {

    options = options || {};
    var allowSession = options.allowSession ? options.allowSession : false;
    var allowOauthConsumer = options.allowOauthConsumer ? options.allowOauthConsumer : false;
    var allowOauthToken = options.allowOauthConsumer ? options.allowOauthConsumer : false;
    var noauth = options.noauth ? options.noauth : false;
    var roles = options.roles ? options.roles : [];

    return function(req, res, next) {

      var checkRoles = function(req, res, next) {
        if (roles.length === 0) {
          next();
        } else {
          for (var i = 0; i < roles.length; i++) {
            if (req.user.roles.indexOf(roles[i]) === -1) {
              return res.send(403, 'Unauthorized (missing role)');
            }
          }
          next();
        }
      };

      var auth = function(req, res, next) {
        if ((!allowSession && !allowOauthConsumer && !allowOauthToken) || noauth) {
          next();
        } else {
          if (allowSession && req.user && req.session) {
            checkRoles(req, res, next);
          } else if (allowOauthToken) {
            passport.authenticate('token', {session: false})(req, res, checkRoles);
          } else if (allowOauthConsumer) {
            passport.authenticate('consumer', {session: false})(req, res, checkRoles);
          } else {
            res.send(403, 'Unauthorized');
          }
        }
      };

      auth(req, res, next);
    };
  }
};
