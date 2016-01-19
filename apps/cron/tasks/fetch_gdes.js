'use strict';

var config = require('../config/config.js'),
  mongoose = require('mongoose'),
  request = require('superagent'),
  Gde = mongoose.model('Gde'),
  slug = require('slugify'),
  async = require('async'),
  TimeQueue = require('timequeue'),
  geocoder = require('node-geocoder').getGeocoder('google', 'https', {apiKey: config.keys.google.simpleApiKey});

require('superagent-retry')(request);

module.exports = function (id, params, taskCallback) {

  var plusWorker = function (url, gde, callback) {
    request.get(url).retry(5).end(function (err, res) {
      if (err) {
        console.log(err);
      }
      callback(err, err ? null : res.body, gde);
    });
  };

  var geocodeWorker = function (ngde, lat, lng, callback) {
    geocoder.reverse(lat, lng, function (err, data) {
      callback(ngde, err, data);
    });
  };

  var plusQueue = new TimeQueue(plusWorker, {concurrency: 4, every: 1000});
  var geocodeQueue = new TimeQueue(geocodeWorker, {concurrency: 3, every: 1000});

  var getGdeIdx = function (list, id) {
    for (var i = 0; i < list.length; i++) {
      if (list[i]._id === id) {
        return i;
      }
    }
    return -1;
  };

  request.get('https://gde-map.appspot.com/gde/list').end(function (err, res) {
    var gdeList = res.body;

    if (err) {
      return taskCallback(err);
    }

    Gde.find({}).exec(function (err, oldGdeList) {

      if (err) {
        taskCallback(err);
      }

      var processedGdes = [];
      async.eachSeries(gdeList, function (gde, gdeCallback) {

        var gplusRegex = /http[s]?:\/\/plus\..*google\.com\/.*(\+[a-zA-Z]+|[0-9]{21}).*/g;

        // jshint -W106
        var match = gplusRegex.exec(gde.social_url);
        // jshint +W106

        if (match) {
          var gplusId = match[1];

          plusQueue.push('https://www.googleapis.com/plus/v1/people/' + gplusId +
            '?fields=id&key=' + config.keys.google.simpleApiKey, gde,
            function (err, res, gde) {

              if (err) {
                gdeCallback(err);
              }

              var ngde = null;
              var idx = getGdeIdx(oldGdeList, res.id);

              if (idx !== -1) {
                ngde = oldGdeList[idx];
                oldGdeList.splice(idx, 1);
              } else {

                idx = getGdeIdx(processedGdes, res.id);

                if (idx !== -1) {
                  ngde = processedGdes[idx];
                } else {
                  ngde = new Gde();
                  ngde._id = res.id;
                }
              }

              ngde.name = gde.name;
              ngde.email = gde.email;

              // jshint -W106
              if (!ngde.products) {
                ngde.products = [];
                ngde.prduct_codes = [];
              }

              if (ngde.products.indexOf(gde.product) === -1) {
                ngde.products.push(gde.product);
                ngde.product_codes.push(
                  slug(gde.product.toLowerCase().replace('+', 'plus').replace(':', '-').replace('--', '-')));
              }
              // jshint +W106

              ngde.active = true;

              if ((ngde.geo && gde.lat !== ngde.geo.lat) || !ngde.geo) {
                ngde.geo = {
                  lat: gde.lat,
                  lng: gde.lng
                };
                ngde.location = gde.address;
                geocodeQueue.push(ngde, gde.lat, gde.lng, function (ngde, err, data) {
                  if (err) {
                    console.log(err);
                  }

                  if (!err && data.length > 0) {
                    ngde.country = data[0].countryCode.toLowerCase();
                  }

                  ngde.save(function (err) {
                    processedGdes.push(ngde);
                    gdeCallback(err);
                  });
                });
              } else {
                ngde.save(function (err) {
                  processedGdes.push(ngde);
                  gdeCallback(err);
                });
              }
            });
        } else {
          gdeCallback(null);
        }
      }, function (err) {
        console.log('Processed GDE Directory');
        if (err) {
          console.log(err);
        }

        if (oldGdeList.length > 0) {
          console.log('GDEs not in the directory anymore: ' + oldGdeList.length);
          for (var i = 0; i < oldGdeList.length; i++) {
            oldGdeList[i].active = false;
            oldGdeList[i].save();
          }
        }

        taskCallback(err);
      });

    });
  });
};
