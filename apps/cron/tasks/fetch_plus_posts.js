'use strict';

var config = require('../config/config'),
  async = require('async'),
  mongoose = require('mongoose'),
  Chapter = mongoose.model('Chapter'),
  PlusPost = mongoose.model('PlusPost'),
  moment = require('moment'),
  TimeQueue = require('timequeue'),
  request = require('superagent');

module.exports = function (id, params, cb) {
  var hashTagRegEx = /#(\w\w+)/g;

  var fetchPosts = function (plusId, nextPageToken, newestPublishDate, callback) {

    var activitiesUrl = 'https://www.googleapis.com/plus/v1/people/' + plusId +
      '/activities/public?maxResults=50&fields=items(geocode%2Cid%2Cobject(actor(displayName%2Cid)%2Cattachments(fullImage%2CobjectType%2Cthumbnails%2Fimage%2Furl)%2Ccontent%2Cid%2Curl)%2Cpublished%2Ctitle%2Curl%2Cverb)%2CnextPageToken&key=' +
      config.keys.google.simpleApiKey;
    if (nextPageToken) {
      activitiesUrl = 'https://www.googleapis.com/plus/v1/people/' + plusId +
        '/activities/public?maxResults=50&fields=items(geocode%2Cid%2Cobject(actor(displayName%2Cid)%2Cattachments(fullImage%2CobjectType%2Cthumbnails%2Fimage%2Furl)%2Ccontent%2Cid%2Curl)%2Cpublished%2Ctitle%2Curl%2Cverb)%2CnextPageToken&pageToken=' +
        nextPageToken + '&key=' + config.keys.google.simpleApiKey;
    }

    request.get(activitiesUrl, function (err, res) {
      var i, j, k;
      var newestPost;

      if (err) {
        return callback(err);
      }

      if (res.body.items) {
        for (i = 0; i < res.body.items.length; i++) {
          var post = res.body.items[i];
          newestPost = null;

          if (!newestPublishDate || moment(post.published).unix() > newestPublishDate.unix()) {
            var postRecord = new PlusPost();

            postRecord.chapter = plusId;
            postRecord.title = post.title;
            postRecord.url = post.url;
            postRecord.verb = post.verb;
            // jshint -W106
            postRecord.published_at = moment(post.published);

            if (!newestPost || moment(postRecord.published_at).unix() > newestPost.unix()) {
              newestPost = moment(postRecord.published_at);
            }
            // jshint +W106

            var hashtags = post.object.content.match(hashTagRegEx);
            postRecord.hashtags = [];

            if (hashtags) {
              for (j = 0; j < hashtags.length; j++) {
                var tag = hashtags[j].replace('#', '').toLowerCase();
                if (postRecord.hashtags.indexOf(tag) === -1 && tag !== '39') {
                  postRecord.hashtags.push(tag);
                }
              }
            }

            if (post.verb === 'share') {
              postRecord.share = {
                'id': post.object.id,
                'url': post.object.url,
                'author': post.object.actor.id,
                'name': post.object.actor.displayName
              };
            }

            postRecord.images = [];
            if (post.object.attachments) {
              for (k = 0; k < post.object.attachments.length; k++) {
                var item = post.object.attachments[k];

                if (item.objectType === 'album' && item.thumbnails) {
                  for (var h = 0; h < item.thumbnails.length; h++) {
                    postRecord.images.push(item.thumbnails[h].image.url);
                  }
                } else if (item.fullImage) {
                  postRecord.images.push(item.fullImage.url);
                }
              }
            }

            var upsert = postRecord.toObject();
            PlusPost.update({_id: post.id}, upsert, {upsert: true}, function (err) {
              if (err) {
                console.log(err);
              }
            }); // jshint ignore:line
          }
        }
      }

      if ((!newestPublishDate || newestPost < newestPublishDate) && res.body.nextPageToken) {
        fetchPosts(plusId, res.body.nextPageToken, newestPublishDate, callback);
      } else {
        callback(null);
      }
    });
  };

  var q = new TimeQueue(fetchPosts, {concurrency: 5, every: 1000});

  Chapter.find({}).exec(function (err, chapters) {
    async.each(chapters, function (chapter, chapterCallback) {
      // Get newest post in Db
      PlusPost.findOne({chapter: chapter._id}, 'published_at', {sort: {'published_at': -1}},
        function (err, post) {
          var newestPublishDate = moment(0);

          if (post) {
            // jshint -W106
            newestPublishDate = moment(post.published_at);
            // jshint +W106
          }

          q.push(chapter._id, null, newestPublishDate, function (err) {
            if (err) {
              console.log(err);
            }
            chapterCallback(err);
          });
        });
    }, function () {
      console.log('[task ' + id + '] fetched_plus_posts');
      cb();
    });
  });
};
