'use strict';
var googleapis = require('googleapis'),
	utils = require('../utils'),
	mongoose = require('mongoose'),
	Chapter = mongoose.model('Chapter'),
	config = require('../config/config');

var oauth2Client = new googleapis.OAuth2Client(
  config.keys.google.oauthClientId,
  config.keys.google.oauthClientSecret,
  'postmessage'
);

var User = mongoose.model('User');

module.exports = {
	signin: function(req, res) {
		if(req.user) {
			Chapter.find({organizers: req.user._id}, function(err, chapters) {
				if (err) { console.log(err); return next(err); }

				var response = {
					msg: 'ok',
					user: req.user._id,
					chapters: []
				};
				for(var i = 0; i < chapters.length; i++) {
					response.chapters.push({ id: chapters[i]._id, name: chapters[i].name });
				}

				return res.send(200, response);
			});
		}

		process.nextTick(function () {
			oauth2Client.getToken(req.body.code, function(err, tokens) {
				if (err) {
					console.error(err);
					return;
				}
				// contains an access_token and optionally a refresh_token.
				// save them permanently.
        // jshint -W106
				oauth2Client.credentials = {
					access_token: tokens.access_token
				};

				utils.getGoogleCert(function(certs) {
					utils.decodeAndVerifyJwt(tokens.id_token, certs, function(err, claims) {
          // jshint +W106

						if (claims.aud === oauth2Client.clientId_) {
							User.findOne({ _id: claims.sub }, function(err, user) {
								if(!user) {
									user = new User();
									user._id = claims.sub;
									user.email = claims.email;
									user.save();
								}

								req.login(user, function(err) {
									if (err) { console.log(err); return next(err); }

									Chapter.find({organizers: user._id}, function(err, chapters) {
										if (err) { console.log(err); return next(err); }

										var response = {
											msg: 'ok',
											user: user._id,
											chapters: []
										};
										for (var i = 0; i < chapters.length; i++) {
											response.chapters.push({ id: chapters[i]._id, name: chapters[i].name });
										}

										res.send(200, response);
									});
								});
							});
						} else {
							req.logout();
							res.send(403, 'Unauthorized');
						}
					});
				});
			});
		});
	}
};
