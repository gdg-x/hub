'use strict'

class ExtendableError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
    this.message = message
    Error.captureStackTrace(this, this.constructor.name)
  }
}

class NotFound extends ExtendableError {
  constructor (m) {
    super(m)
    this.httpStatus = 404
  }
}

class BadData extends ExtendableError {
  constructor (m) {
    super(m)
    this.httpStatus = 400
  }
}

class Unauthorized extends ExtendableError {
  constructor (m) {
    super(m)
    this.httpStatus = 403
  }
}

exports.NotFound = NotFound
exports.BadData = BadData
exports.Unauthorized = Unauthorized
exports.ErrorMiddleware = function ErrorMiddleware (err, req, res, next) {
  if (err.httpStatus) {
    res.status(err.httpStatus)
  }
  if (err.name === 'MongoError' && /duplicate/.test(err.message)) {
    res.status(400)
  }
  next(err)
}
