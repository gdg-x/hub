'use strict';

var express = require('express'),
	documentation = require('./documentation.js'),
	annotations = require('express-annotations');

module.exports = function(app) {
	var versions = [];

	require("fs").readdirSync(__dirname + '/').forEach(function(file) {
		if (file.match(/.+\.js/g) == null) {
			var version = file;
	 		versions.push(version);

			var impl = express();
			annotations.extend(impl);

			impl.route = function(method, path, metadata) {
				var args = Array.prototype.slice.call(arguments);

				if(metadata)
					impl.annotate(method+"-"+path, metadata);
				
				impl[method](path, args.slice(3));
			};

	 		require("./"+file)(impl);

	 		documentation(version, app, impl);
	 		
	 		app.use("/api/"+ version, impl);
		}
	});	

	app.get('/api/versions', function(req, res) {
 		res.json(versions);
	});
}