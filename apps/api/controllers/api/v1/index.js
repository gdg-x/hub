'use strict';

module.exports = function (app, cacher) {

  // Version Metadata
  app.set('metadata', {
    name: 'hub',
    title: 'GDG[x] Hub API',
    description: 'Everything GDG',
    ownerName: 'GDG[x]',
    status: 'alpha',
    icons: {
      'x16': 'https://hub.gdgx.io/images/icons/apis/hub-16.png',
      'x32': 'https://hub.gdgx.io/images/icons/apis/hub-32.png'
    },
    protocol: 'rest'
  });
  require('fs').readdirSync(__dirname + '/').forEach(function (file) {
    if (file.match(/.+\.js/g) !== null && file !== 'index.js') {
      require('./' + file)(app, cacher);
    }
  });
};
