/* jshint camelcase: false */
var config = require('config');
var passport = require('passport');
var log = require('../log/')(module);
var mongoose = require('mongoose');
var OauthConsumer = mongoose.model('OauthConsumer');
var OauthClient = mongoose.model('OauthClient');
var ConsumerStrategy = require('passport-http-oauth').ConsumerStrategy;
var TokenStrategy = require('passport-http-oauth').TokenStrategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var utils = require('../utils');

exports.init = function (cb) {
  var User = mongoose.model('User');
  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function (id, done) {
    User.findOne({_id: id}).exec(done);
  });


  passport.use('consumer', new ConsumerStrategy(
    function (consumerKey, done) {
      OauthConsumer
        .findOne({consumer_key: consumerKey}, function (err, client) {
          if (err) {
            return done(err);
          }
          if (!client) {
            return done(null, false);
          }
          return done(null, client, client.consumer_secret);
        });
    },
    function (requestToken, done) {
      OauthClient
        .findOne({request_token: requestToken}, function (err, token) {
          if (err) {
            return done(err);
          }

          var info = {
            verifier: token.verifier,
            clientID: token.consumer,
            userID: token.user,
            approved: token.approved
          };
          done(null, token.request_token_secret, info);
        });
    },
    function (timestamp, nonce, done) {
      done(null, true);
    }
  ));

  passport.use('token', new TokenStrategy(
    function (consumerKey, done) {
      OauthConsumer
        .findOne({consumer_key: consumerKey}, function (err, client) {
          if (err) {
            return done(err);
          }
          if (!client) {
            return done(null, false);
          }
          return done(null, client, client.consumer_secret);
        });
    },
    function (accessToken, done) {
      OauthClient
        .findOne({access_token: accessToken}, function (err, token) {
          if (err) {
            return done(err);
          }
          User.findOne({_id: token.userID}, function (err, user) {
            if (err) {
              return done(err);
            }
            if (!user) {
              return done(null, false);
            }
            // to keep this example simple,
            // restricted scopes are not implemented
            var info = {scope: '*'};
            done(null, user, token.access_token_secret, info);
          });
        });
    },
    function (timestamp, nonce, done) {
      done(null, true);
    }
  ));

  passport.use('bearer-frisbee', new BearerStrategy(
    function (token, done) {
      utils.getGoogleCert(function (certs) {
        utils.decodeAndVerifyJwt(token, certs, function (err, claims) {

          if (claims.aud === config.keys.frisbee.serverClientId &&
            config.keys.frisbee.androidClientIds.indexOf(claims.azp) !== -1) {

            User.findOne({_id: claims.sub}, function (err, user) {
              if (err) {
                return done(err);
              }
              if (!user) {
                user = new User();
                user._id = claims.sub;
                user.email = claims.email;
                user.save();
              }

              return done(null, user, {});
            });
          } else {
            return done(null, false);
          }
        });
      });
    }
  ));

  log.info('passport init');
  if (cb) {
    cb();
  }
};
