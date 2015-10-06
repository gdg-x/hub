'use strict';

var mongoose = require('mongoose'),
  fs = require('fs'),
  Country = mongoose.model('Country');

module.exports = function () {
  Country.count({}, function (err, count) {
    if (count === 0) {
      fs.readFile(__dirname + '/countries.json', 'utf8', function (err, data) {
        if (err) {
          console.log('Error: ' + err);
          return;
        }

        data = JSON.parse(data);
        data.forEach(function (country) {
          country._id = country.cca2.toLowerCase();
          country.cca3 = country.cca3.toLowerCase();
          var c = new Country(country);
          c.save();
        });
      });
    }
  });
};
