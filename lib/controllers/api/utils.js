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
	},

	fixCacher: function(Cacher) {
		Cacher.prototype.buildEnd = function(res, key, staleKey, realTtl, ttl) {
			var STALE_CREATED = 1
			var origEnd = res.end
			var self = this

			res.end = function (data) {
				res._responseBody += data

				var cachedHeaders = {};
				for (var header in res._headers) {
					if(!header.substring(0,2) == "X-" && header != "Set-Cookie")
	    				cachedHeaders[header] = res._headers[header];
	  			}

				var cacheObject = {statusCode: res.statusCode, content: res._responseBody, headers: cachedHeaders}
				self.client.set(key, cacheObject, realTtl, function(err) {
					if (err) {
						self.emit("error", err)
					}
					self.client.set(staleKey, STALE_CREATED, ttl, function(err) {
						if (err) {
							self.emit("error", err)
						}
						self.emit("cache", cacheObject)
					})
				})
				return origEnd.apply(res, arguments)
			}
		};

		Cacher.prototype.cache = function(unit, value) {
			var self = this;
			var STALE_REFRESH = 2
			var GEN_TIME = 30

			var HEADER_KEY = 'Cache-Control'
			var NO_CACHE_KEY = 'no-cache'
			var MAX_AGE_KEY = 'max-age'
			var MUST_REVALIDATE_KEY = 'must-revalidate'
			// set noCaching to true in dev mode to get around stale data when you don't want it
			var ttl = self.calcTtl(unit, value)
			if (ttl === 0 || this.noCaching) {
				return function(req, res, next) {
					res.header(HEADER_KEY, NO_CACHE_KEY)
					next()
				}
			}


			return function(req, res, next) {
				// only cache on get and head
				if (req.method !== 'GET' && req.method !== 'HEAD') {
					return next()
				}

				var key = self.genCacheKey(req)
				var staleKey = key + ".stale"
				var realTtl = ttl + GEN_TIME * 2

				self.client.get(key, function(err, cacheObject) {
					if (err) {
						self.emit("error", err)
						return next()
					}
					// if the stale key expires, we let one request through to refresh the cache
					// this helps us avoid dog piles and herds
					self.client.get(staleKey, function(err, stale) {
						if (err) {
							self.emit("error", err)
							return next()
						}

						res.header(HEADER_KEY, MAX_AGE_KEY + "=" + ttl + ", " + MUST_REVALIDATE_KEY);

						if (!stale) {
							self.client.set(staleKey, STALE_REFRESH, GEN_TIME)
							cacheObject = null
						}

						if (cacheObject) {
							self.emit("hit", key)
							return self.sendCached(res, cacheObject)
						}

						res._responseBody = ""

						self.buildEnd(res, key, staleKey, realTtl, ttl)
						self.buildWrite(res)

						res.header(self.cacheHeader, false)
						next()
						self.emit("miss", key)
					})
				})
			}
		};
	}
}