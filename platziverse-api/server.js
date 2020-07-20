'use strict'

const debug = require('debug')('paltziverse:api:server')
const chalk = require('chalk')
const http = require('http')
const express = require('express')

const api = require('./api')

const port = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)

app.use('/api', api)

app.use((err, req, res, next) => {
  debug(`${chalk.red('[ERROR]')} ${err.message}`)

  if (err.message.match(/not found/)) {
    return res.status(404).send({ error: err.message })
  }

  res.status(500).send({ error: err.message })
})

function handleFatalError (error) {
  console.error(`${chalk.red('[FATAL ERROR]')} ${error.message}`)
  console.error(error.stack)
  process.exit(1)
}

if (!module.parent) {
  process.on('uncaughtException', handleFatalError)
  process.on('unhandledRejection', handleFatalError)

  server.listen(port, () => {
    console.log(`${chalk.green('[platziverse-api]')} server listening on port: ${port}`)
  })
}

module.exports = server
