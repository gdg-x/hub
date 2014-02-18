'use strict';

var passport = require('passport'),
	express = require('express');

/**
 * Custom middleware used by the application
 */
module.exports = {
	auth: function(options) {

		options = options || {};
		var allowSession = options.allowSession != undefined ? options.allowSession : true;
		var allowOauthConsumer = options.allowOauthConsumer != undefined ? options.allowOauthConsumer : false;
		var allowOauthToken = options.allowOauthConsumer != undefined ? options.allowOauthConsumer : false;
		var requireCsrf = options.requireCsrf != undefined ? options.requireCsrf : true;
		var noauth = options.noauth != undefined ? options.noauth : false;

		return function(req, res, next) {

			var auth = function(req, res, next) {
				if((!allowSession && !allowOauthConsumer && !allowOauthToken) || noauth) {
					next();
				} else {
					console.log(req.user);
					if(allowSession && req.user && req.session) {
						next();
					} else if(allowOauthToken) {
						passport.authenticate('token', { session: false })(req,res,next);
					} else if(allowOauthConsumer) {
						passport.authenticate('consumer', { session: false })(req,res,next);
					} else res.send(400, "Unauthorized");
				}
			};

			if(requireCsrf) {
				var csrfValue = function(req) {
					var token = (req.body && req.body._csrf)
					|| (req.query && req.query._csrf)
					|| (req.headers['x-csrf-token'])
					|| (req.headers['x-xsrf-token']);
					return token;
				};

				express.csrf({value: csrfValue})(req, res, function() {
					res.cookie('XSRF-TOKEN', req.csrfToken());
					auth(req, res, next);
				});

			} else {
				auth(req, res, next);
			}
		};
	}
};