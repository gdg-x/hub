'use strict'

const express = require('express')
const compression = require('compression')
const http = require('http')
const cors = require('cors')
const db = require('./db')

const app = express()
const server = http.Server(app)
const io = require('socket.io')(server)
const api = require('./api')
const bodyParser = require('body-parser')

db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', console.log.bind(console, 'connected to mongodb'))

app.locals.io = io

app.use(cors())
app.use(compression())
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Hub is up!')
})

app.use('/api', api)

module.exports = server
