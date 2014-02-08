'use strict';

var methods = require('express/node_modules/methods');

module.exports = function(version, app, impl) {

	var meta = impl.get('metadata');

	if(meta) {
		app.get('/api/'+version+"/rest", function(req, res) {
			var response = {
				kind: "discovery#restDescription",
				version: version,
				name: meta.name,
				title: meta.title,
				description: meta.description,
				ownerDomain: "hub.gdgx.io",
				ownerName: meta.ownerName,
				resources: {
					url: {
						methods: {
						}
					}
				}
			};

			methods.forEach(function(method) {
				if(impl.routes[method]) {
					impl.routes[method].forEach(function(method) {
						var info = {
							id: meta.name+"."+method.path.replace("/","").replace(/\//g,'.'),
							path: method.path,
							method: method.method,
						};

						if(impl.annotations[method.method+"-"+method.path]) {
							info.doc = impl.annotations[method.method+"-"+method.path];
						}

						response.resources.url.methods[method.path.replace("/","").replace(/\//g,'.')] = info; 
					});
				}
			});
			res.json(response);
		});
	}
}