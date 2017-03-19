'use strict'

/**
 * Returns a list containing all Chapters
 */
exports.listChapters = function listChapters (req, res, next) {
  utils.getModel('Chapter', {}, [['country', 'name']])
}

/**
 * Returns a list containing all Chapters of the specified Country
 */
exports.listChaptersForCountry = function listChaptersForCountry (req, res, next) {
  utils.getModel('Chapter', {
    country: 'country'
  }, [['country', 'name']])
}

/**
 * Returns a list of chapters which are within :maxDistance of the specified lat, lng (distances are expressed in kilometers)
 */
exports.listChaptersNearby = function listChapters (req, res, next) {
  if (!req.params.lat || !req.params.lng) {
    return res.send(500, 'Please specify lat and lng')
  }

  mongoose.connection.db.executeDbCommand({
    geoNear: 'chapters', // the mongo collection
    near: [parseFloat(req.params.lng), parseFloat(req.params.lat)], // the geo point
    spherical: true, // tell mongo the earth is round, so it calculates based on a spherical location system
    distanceMultiplier: 6371, // 6378.137,
    maxDistance: parseFloat(req.params.maxDistance) / 6371
  }, function (err, result) {
    if (err) {
      console.error(err)
      return res.send(500, 'Internal Server Error')
    }
    res.jsonp(result.documents[0].results)
  })
}

/**
 * Returns information on a single Chapter
 */
exports.getChapter = function getChapter (req, res, next) {
  utils.getModel('Chapter', {
    _id: 'chapterId'
  }, [['country', 'name']], true)
}
