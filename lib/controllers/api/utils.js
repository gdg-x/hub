'use strict';

var mongoose = require('mongoose'),
	extend = require('util')._extend;

module.exports = {
	buildQuery: function(query, options) {
		var skip = options.skip;
		var limit = options.limit;
		var sort = options.sort;
		var asc = options.asc || 1;
		var fields = options.fields;

		asc = parseInt(asc);

		if(limit == undefined)
			limit = 30;

		var count = options.count;

		delete options.sort;
		delete options.asc;
		delete options.fields;
		delete options.count;
		delete options.page;
		delete options.perpage;

		/*for(var key in options) {
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
		}*/

		if(count == undefined) {
			if(sort) {
				var so = {};
				so[sort] = asc;
				query.options["sort"] = so;
			}
			if(fields) {
				query.select(fields.split(/[ ,]+/).join(' '))
			}
		}

		return query;
	},

	paginate: function(q, page, resultsPerPage, callback) {
		callback = callback || function(){};
		page = (!isNaN(page) && page != undefined) ? parseInt(page) : 1;
		resultsPerPage = resultsPerPage || 25;
		var skipFrom = (page * resultsPerPage) - resultsPerPage;

		var query = q.skip(skipFrom).limit(resultsPerPage);

		query.exec(function(error, results) {
		    if (error) {
		      callback(error, null, null, null, null, null);
		    } else {
		      q.model.count(q, function(error, count) {
		        if (error) {
		          callback(error, null, null);
		        } else {
		          var pageCount = Math.ceil(count / resultsPerPage);
		          if (pageCount == 0) {
		            pageCount = 1;
		          };
		          callback(null, count, page, resultsPerPage, pageCount, results);
		        };
		      });
		    };
		});
	},

	parseAndOr: function(query, key, value, it) {
		if(typeof value === 'object')
			return;

		if(value.indexOf(",") != -1) {
			var elements = value.split(',');
			query["$or"] = [];

			delete query[key];

			for(var i = 0; i < elements.length; i++) {
				var o = {}

				query["$or"].push(this.parseAndOr(query, key, elements[i], true));
			}
		} else if(value.indexOf("+") != -1) {
			var elements = value.split('+');

			var target;

			if(it) {
				var o = {}
				o["$and"] = [];
				for(var i = 0; i < elements.length; i++) {
					var or = {};
					or[key] = elements[i];
					o["$and"].push(or);
				}
				return o;
			} else {
				delete query[key];

				query["$and"] = [];
				for(var i = 0; i < elements.length; i++) {
					var o = {}
					o[key] = elements[i];

					query["$and"].push(o);
				}
			}

		} else {

			if(it) {
				var o = {}
				o[key] = value;
				return o;
			} else {
				query[key] = value;
			}
		}
	},

	getModel: function(model, baseQuery, populate, one, options) {
		var me = this;
		one = one != undefined ? one : false;
		populate = populate || [];
		options = options || {};

		return function(req, res) {
			var Model = mongoose.model(model);

			var query = extend({}, baseQuery)

			for(var key in query) {
				me.parseAndOr(query, key, req.params[query[key]]);
			}

			var targetQuery;
			var count = false;

			if(req.query.count != undefined) {
				count = true;
				targetQuery = Model.count(query);
			} else {

				if(one) {
					targetQuery = Model.findOne(query, null, options);
				} else {
					targetQuery = Model.find(query, null, options);
				}

				for(var i = 0; i < populate.length; i++) {
					var item = populate[i];

					if(item instanceof Array) {
						targetQuery = targetQuery.populate(item[0], item[1]);
					} else {
						targetQuery = targetQuery.populate(item);
					}
				}
			}

			if(count) {
				me.buildQuery(targetQuery, req.query).exec(function(err, count) {
					if(err) {
						console.log(err);
						res.send(400, 'Bad request');
					} else {
						res.jsonp({ count: count });
					}
				});
			} else if(one) {
				me.buildQuery(targetQuery, req.query).exec(function(err, item) {
					if(err) {
						console.log(err);
						res.send(400, 'Bad request');
					} else {
						if(!item)
							res.send(404, "Not found");
						else
							res.jsonp(item);
					}
				});
			} else {
				var page = req.query.page;
				var perpage = req.query.perpage;
				me.paginate(me.buildQuery(targetQuery, req.query), page, perpage, function(err, count, page, resultsPerPage, pageCount, results) {
					if(err) {
						console.log(err);
						res.send(400, 'Bad request');
					} else {
						res.jsonp({
							"count": count,
							"pages": pageCount,
							"page": page,
							"perPage": resultsPerPage,
							"items": results
						});
					}
				});
			}
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

	  			if(res.statusCode == 200) {
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
				}
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