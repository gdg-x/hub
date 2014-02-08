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
		else return passport.authenticate('bearer', { session: false })(req, res, next);
	}
};