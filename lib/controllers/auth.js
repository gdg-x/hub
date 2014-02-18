'use strict';
var googleapis = require('googleapis'),
	utils = require('../utils'),
	config = require('../config/config');

var oauth2Client = new googleapis.OAuth2Client(config.keys.google.oauthClientId, config.keys.google.oauthClientSecret, "postmessage");

var mongoose = require('mongoose'),
	User = mongoose.model('User');

module.exports = {
	signin: function(req, res) {
		if(req.user) {
			return res.send(200, "ok"); 
		}
		
		process.nextTick(function () {
			oauth2Client.getToken(req.body.code, function(err, tokens) {
				if(err) {
					console.error(err);
					return;
				}
				// contains an access_token and optionally a refresh_token.
				// save them permanently.
				oauth2Client.credentials = {
					access_token: tokens['access_token']
				};

				utils.getGoogleCert(function(certs) {
					utils.decodeAndVerifyJwt(tokens['id_token'], certs, function(err, claims) {

						if(claims["aud"] == oauth2Client.clientId_) {
							User.findOne({ _id: claims['sub'] }, function(err, user) {
								if(!user) {
									user = new User();
									user._id = claims['sub'];
									user.email = claims['email'];
									user.save();
								}

								req.login(user, function(err) {
									if (err) { console.log(err); return next(err); }
									return res.send(200, "ok");
								})
							});
						} else {
							req.logout();
							res.send(403,"Unauthorized");
						}
					});
				});

			});
		});
	}
}