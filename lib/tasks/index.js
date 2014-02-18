'use strict';

var risky = require('../risky.js');

module.exports = function() {
	require("fs").readdirSync(__dirname + '/').forEach(function(file) {
		if (file.match(/.+\.js/g) !== null && file !== 'index.js') {
	 		risky.setTaskHandler(file.replace('.js', ''), require("./"+file));
		}
	});	
}