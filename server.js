var config = require('config');
var async = require('async');
var log = require('./libs/log/')(module);
var mongooseUtil = require('./libs/mongoose/');

var server = function (done) {
  mongooseUtil.init(function () {
    var app = {
      api: require('./apps/api/'),
      cron: require('./apps/cron/')
    };
    var servers = {};
    async.seq(
      function (cb) {
        if (config.app.api.enabled) {
          app.api.init(function (apiApp) {
            servers.api = apiApp;
            cb();
          });
        } else {
          cb();
        }
      },
      function (cb) {
        if (config.app.cron.enabled) {
          app.cron.init(function (cronApp) {
            servers.cron = cronApp;
            cb();
          });
        } else {
          cb();
        }
      }
    )(function (err) {
      if (done) {
        done(err, servers);
      }
    });
  });
};

if (require.main === module) {
  log.info('server is started in standalone mode');
  server();
} else {
  log.info('server is started for testing');
  module.exports = server;
}

if (config.status === 'prod') {
  process.on('uncaughtException', function (err) {
    //noinspection JSCheckFunctionSignatures
    log.error(JSON.parse(
      JSON.stringify(err, ['stack', 'message', 'inner'], 3)));
  });
}
