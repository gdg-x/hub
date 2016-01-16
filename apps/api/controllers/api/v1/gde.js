'use strict';

var mongoose = require('mongoose'),
  utils = require('../../../../../libs/express/utils'),
  Gde = mongoose.model('Gde'),
  slug = require('slugify');

module.exports = function (app, cacher) {

  app.route('get', '/gdes', {
    summary: 'Returns a list containing all GDEs'
  }, cacher.cache('hours', 24), utils.getModel('Gde', {}, [['country', 'name']]));


  app.route('get', '/gdes/products', {
    summary: 'Returns a list of all the products there are GDEs for'
  }, cacher.cache('hours', 2), function (req, res) {
    Gde.aggregate([
      {$match: {}}, /* Query can go here, if you want to filter results. */
      {$project: {products: 1}}, /* select the tokens field as something we want to 'send' to the next command in the chain */
      {$unwind: '$products'}, /* this converts arrays into unique documents for counting */
      {
        $group: {
          /* execute 'grouping' */
          _id: '$products', /* using the 'token' value as the _id */
          count: {$sum: 1} /* create a sum value */
        }
      }
    ], function (err, products) {
      var productsList = [];

      if (err) {
        return res.send(500, err);
      }

      if (products) {
        for (var i = 0; i < products.length; i++) {
          productsList.push({
            name: products[i]._id,
            // jshint -W106
            product_code: slug(products[i]._id.toLowerCase().replace('+', 'plus').replace(':', '-').replace('--', '-'))
            // jshint +W106
          });
        }
      }
      return res.json(productsList);
    });
  });

  app.route('get', '/gdes/product/:productCode', {
    summary: 'Returns a list containing all GDEs for a specified Product code'
  }, cacher.cache('hours', 24), utils.getModel('Gde', {
    // jshint -W106
    product_codes: 'productCode'
    // jshint +W106
  }, [['country', 'name']]));

  app.route('get', '/gdes/country/:country', {
    summary: 'Returns a list containing all GDEs of the specified Country'
  }, cacher.cache('hours', 24), utils.getModel('Gde', {
    country: 'country'
  }, [['country', 'name']]));

  app.route('get', '/gdes/:gdeId', {
    summary: 'Returns information on a single GDE'
  }, cacher.cache('hours', 24), utils.getModel('Gde', {
    _id: 'gdeId'
  }, [['country', 'name']], true));
};
