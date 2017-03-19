'use strict'

/**
 * Returns a list of all Event Tags in the Hub Database
 */
exports.listTags = function listTags (req, res, next) {
  utils.getModel('Tag', {}, null, false, null)
}

/**
 * Returns information on a single tag
 */
exports.getTag = function getTag (req, res, next) {
  utils.getModel('Tag', {
    _id: 'tagId'
  }, null, true, null)
}

/**
 * Updates a single tag, requires admin role
 */
exports.updateTag = function updateTag (req, res, next) {
  var tag = req.body
  var tagId = req.params.tagId
  console.log('Updating tag: ' + tagId)
  Tag.findOne({_id: tagId}, function (err, data) {
    console.log('err ', err)
    console.log('data ', data)
    data.title = tag.title
    data.description = tag.description
    data.color = tag.color
    data.save(function (err) {
      if (err) {
        console.log(err)
        resp.send('400', 'Bad request')
      } else {
        resp.jsonp(data)
      }
    })
  })
}
