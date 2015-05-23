'use strict';

module.exports = function () {
  require("fs").readdirSync(__dirname + '/').forEach(function (file) {
    if (file.match(/.+\.js/g) !== null && file.match(/.+\.json/g) === null && file !== 'index.js') {
      require("./" + file)();
    }
  });
};
