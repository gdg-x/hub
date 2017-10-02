'use strict'

const PubSub = require('@google-cloud/pubsub')
const pubsub = PubSub()

const MEETUP_API_KEY = process.env.MEETUP_API_KEY || 'NO_KEY_SPECIFIED'
const meetup = require('meetup-api')({key: MEETUP_API_KEY})

/**
 * Publishes a message to a Cloud Pub/Sub Topic.
 * This is to be used along with a CRON job in the code that is part of hub app
 *
 * @example
 * gcloud alpha functions call publish --data '{"topic":"[meetup_data_ingestion]","message":"Hello, world!"}'
 *
 *   - Replace `[meetup_data_ingestion]` with your Cloud Pub/Sub topic name.
 *
 * @param {object} req Cloud Function request context.
 * @param {object} req.body The request body.
 * @param {string} req.body.topic Topic name on which to publish.
 * @param {string} req.body.message Message to publish.
 * @param {object} res Cloud Function response context.
 */
exports.publish = function publish (req, res) {
  if (!req.body.topic) {
    res.status(500).send(new Error('Topic not provided. Make sure you have a "topic" property in your request'))
    return
  } else if (!req.body.message) {
    res.status(500).send(new Error('Message not provided. Make sure you have a "message" property in your request'))
    return
  }

  console.log(`Publishing message to topic ${req.body.topic}`)

  // References an existing topic
  const topic = pubsub.topic(req.body.topic)

  const message = {
    data: {
      message: req.body.message
    }
  }

  // Publishes a message
  return topic.publish(message)
    .then(() => res.status(200).send('Message published.'))
    .catch((err) => {
      console.error(err)
      res.status(500).send(err)
      return Promise.reject(err)
    })
}

/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 * This will be used on functions where it will be listening to the publish event
 *
 * @param {object} event The Cloud Functions event.
 * @param {object} event.data The Cloud Pub/Sub Message object.
 * @param {string} event.data.data The "data" property of the Cloud Pub/Sub Message.
 * @param {function} The callback function.
 */
exports.subscribe = function subscribe (event, callback) {
  const pubsubMessage = event.data

  // We're just going to log the message to prove that it worked!
  console.log(Buffer.from(pubsubMessage.data, 'base64').toString())

  // Don't forget to call the callback!
  callback()
}

function getMyEvents () {
  meetup.getEvents({'member_id': 'self'}, logger)
}

function logger (err, result) {
  if (err) {
    console.error(err)
  } else {
    console.log(result)
  }
}

getMyEvents()
