'use strict';

var utils = require('../utils'),
    mongoose = require('mongoose'),
    middleware = require('../../../middleware'),
    Tag = mongoose.model('Tag');

module.exports = function (app, cacher) {
  app.route('get', '/tags', {
    summary: 'Returns a list of all Event Tags in the Hub Database'
  }, cacher.cache('hours', 24), utils.getModel('Tag', {}, null, false, null));

	app.route('get', '/tags/:tagId', {
			summary: 'Returns information on a single tag'
		}, cacher.cache('hours', 2), utils.getModel('Tag', {
			_id: 'tagId'
		}, null, true, null));

	app.route('put', '/tags/:tagId', {
		  summary: 'Updates a single tag, requires admin role'
  },
    middleware.auth({roles: ['admin']}), function(req, resp) {
			var tag = req.body;
			var tagId = req.params.tagId;
			console.log(tag);
			Tag.findOne({_id: tagId}, function(err, data){
				console.log('err ', err);
				console.log('data ', data);
				data.title = tag.title;
				data.description = tag.description;
				data.color = tag.color;
				data.save(function (err) {
					if (err) {
						console.log(err);
						resp.send('400', 'Bad request');
					} else {
						resp.jsonp(data);
					}
				});
			});
    }
  );
};
