'use strict';

var risky = require('../risky.js');

module.exports = function() {
	require("fs").readdirSync(__dirname + '/').forEach(function(file) {
		if (file.match(/.+\.js/g) !== null && file !== 'index.js') {
      var taskName = file.replace('.js', '');
      console.log('Setting Task Handler for ' + taskName);
	 		risky.setTaskHandler(taskName, require("./"+file));
    }
	});
};
