'use strict';

var mongoose = require('mongoose'),
  Chapter = mongoose.model('Chapter');

module.exports = function (app, cacher) {
  app.route('get', '/organizer/:gplusId', {
    summary: 'Returns if the specified Google+ user is an Organizer of one or more Chapters'
  }, cacher.cache('hours', 24), function (req, res) {
    Chapter.find({organizers: req.params.gplusId}, function (err, chapters) {
        if (err) {
          console.log(err);
          return res.send(500, 'Internal Error');
        }

        var response = {
          user: req.params.gplusId,
          chapters: []
        };
        for (var i = 0; i < chapters.length; i++) {
          response.chapters.push({id: chapters[i]._id, name: chapters[i].name});
        }

        return res.jsonp(response);
      }
    );
  });
};
