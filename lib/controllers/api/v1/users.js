'use strict';

var mongoose = require('mongoose'),
	utils = require('../utils'),
	User = mongoose.model('User'),
	Application = mongoose.model('Application'),
	SimpleApiKey = mongoose.model('SimpleApiKey'),
	OauthConsumer = mongoose.model('OauthConsumer'),
	Event = mongoose.model('Event'),
	middleware = require('../../../middleware'),
	devsite = require('../../../clients/devsite');

module.exports = function(app, cacher) {

}
