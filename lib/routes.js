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
  app.get('/', index.index);
  app.get('/mu-7420b817-cdecfc50-f5d31e37-c96b5e8f', index.blitzio);
};