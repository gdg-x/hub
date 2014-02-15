'use strict';

var passport = require('passport');

/**
 * Custom middleware used by the application
 */
module.exports = {

	/**
	 *  Protect routes on your api from unauthenticated access
	 */
	auth: function auth(req, res, next) {
		if(req.user) next();
		else if(req.query.apikey) return passport.authenticate('localapikey', { session: false })(req, res, next);
		else return passport.authenticate('bearer', { session: false })(req, res, next);
	}
};