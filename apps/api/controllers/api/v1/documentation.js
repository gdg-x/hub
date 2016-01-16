var data = require('./documentation-data.json');
module.exports = function (version, app) {
  app.get('/api/' + version + '/rest', function (req, res) {
    res.json(data);
  });
};
