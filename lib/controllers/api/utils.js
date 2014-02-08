'use strict';

var mongoose = require('mongoose'),
	extend = require('util')._extend;

module.exports = {
	buildQuery: function(query, options) {
		var skip = options.skip;
		var limit = options.limit;
		var sort = options.sort;
		var fields = options.fields;

		if(limit == undefined)
			limit = 30;


		delete options.skip;
		delete options.limit;
		delete options.sort;
		delete options.fields;

		for(var key in options) {
			query.where(key);

			var value = options[key];
			if('>' == value[0]) {
				if('=' == value[1]) {
					query.gte(value.substr(2));
				} else {
					query.gt(value.substr(1));
				}
			}
			else if('<' == value[0]) {
				if('=' == value[1]) {
					query.lte(value.substr(2));
				} else {
					query.lt(value.substr(1));
				}
			} else {
				query.equals(value);
			}
		}

		if(skip) {
			query.skip(skip);
		}
		if(limit && limit != "n") {
			query.limit(limit);
		}
		if(sort) {
			query.sort(sort);
		}
		if(fields) {
			query.select(fields.split(/[ ,]+/).join(' '))
		}

		return query;
	},

	getModel: function(model, baseQuery) {
		var me = this;
		return function(req, res) {
			var Model = mongoose.model(model);

			var query = extend({}, baseQuery)

			for(var key in query) {
				var value = query[key];
				if(req.params[value]) {
					query[key] = req.params[value];
				}
			}

			me.buildQuery(Model.find(query), req.query).exec(function(err, items) {
				if(err) {
					res.send(400, 'Bad request');
				} else {

					if(items.length == 0) {
						res.send(404, "Not found");
					} else if(items.length == 1) {
						res.jsonp(items[0]);
					} else {
						res.jsonp(items);
					}
				}
			});
		};
	}
}