var config = require('config');
var appName = config.status + ':' + config.name;
/*jshint camelcase: false*/
exports.config = {
  app_name: [appName],
  license_key: config.newrelic.key,
  agent_enabled: (config.status == 'prod'),
  logging: {level: 'trace'}
};
/*jshint camelcase: true*/
