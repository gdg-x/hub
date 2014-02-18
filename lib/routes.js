'use strict';

var api = require('./controllers/api'),
    index = require('./controllers'),
    middleware = require('./middleware'),
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
  
  app.get('/mu-7420b817-cdecfc50-f5d31e37-c96b5e8f', index.blitzio);

  app.get('/', index.index);
};