'use strict';

var jobs = require('../config/cron.js')();

module.exports = function() {
	require("fs").readdirSync(__dirname + '/').forEach(function(file) {
		if (file.match(/.+\.js/g) !== null && file !== 'index.js') {
	 		jobs.addJob(require("./" + file));
		}
	});	
}