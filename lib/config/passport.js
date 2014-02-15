'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    passport = require('passport'),
    SimpleApiKey = mongoose.model('SimpleApiKey'),
    LocalAPIKeyStrategy = require('passport-localapikey').Strategy,
	BearerStrategy = require('passport-http-bearer').Strategy,
	request = require('superagent');

/**
 * Passport configuration
 */
module.exports = function() {
	passport.serializeUser(function(user, done) {
		done(null, user._id);
	});

	passport.deserializeUser(function(id, done) {
		User.findOne({_id: id}, function(err, user) {
			done(err, user);
		});
	});

	passport.use(new LocalAPIKeyStrategy(
		function(apiKey, done) {
			SimpleApiKey.findOne({ api_key: apiKey }, function (err, simpleApiKey) {
			  if (err) { return done(err); }
			  if (!simpleApiKey) { return done(null, false); }
			  return done(null, simpleApiKey);
			});
		}
	));

	passport.use(new BearerStrategy(
		function(token, done) {
			process.nextTick(function () {
				User.findOne({ token: token }, function (err, user) {
					if (err) { return done(err); }
					if (!user) {
						request.get('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token='+token,
							function(error, response) {
								var tokenInfo = response.body;
								if(tokenInfo.error != undefined) {
									return done(response.error);
								} else {
									if(tokenInfo.user_id) {
										User.findOne({ _id: tokenInfo.user_id }, function (err, user) {
											if (err) { return done(err); }
											if(user) {
												user.token = token;
												user.expires_at = Date.now() + (tokenInfo.expires_in)*1000;
												user.email = tokenInfo.email;
												user.save();
												return done(null, user, { scope: 'all' });
											} else {
												request.get('https://www.googleapis.com/oauth2/v1/userinfo?access_token='+token,
													function(error, response) {
														var userInfo = response.body;
														if(userInfo.error) {
															return done(userInfo.error.message);
														} else {
															user = new User();
															user.token = token;
															user._id = userInfo.id;

															if(userInfo.email != undefined) {
																user.email = userInfo.email;
																user.locale = userInfo.locale;
																user.given_name = userInfo.given_name;
																user.family_name = userInfo.family_name;
																user.gender = userInfo.gender;
																user.picture = userInfo.picture;
															}

															user.scope = tokenInfo.scope;
															user.expires_at = Date.now() + (tokenInfo.expires_in)*1000;
															user.save();
															return done(null, user, { scope: 'all' });
														}
													}
												);
											}
										});
									}
								}
							}
						);
					} else {
						console.log("user");
						return done(null, user, { scope: 'all' });
					}
				});
			});
		}
	));
};