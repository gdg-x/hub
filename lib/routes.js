'use strict';

var api = require('./controllers/api'),
    index = require('./controllers'),
    auth = require('./controllers/auth');

/**
 * Application routes
 */
module.exports = function(app) {

  // Server API Routes
  api(app);

  app.post('/signin', auth.signin);

  // All other routes to use Angular routing in app/scripts/app.js
  app.get('/partials/*', index.partials);
  app.get('/directives/*', index.partials);

  app.get('/*', function(req, res, next) {
    if(req.url.indexOf('api/') !== -1) {
      next();
    } else {
      index.index(req,res,next);
    }
  });
};
