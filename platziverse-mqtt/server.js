'use strict'

const debug = require('debug')('platziverse:mqtt:server')
const chalk = require('chalk')
const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
const db = require('platziverse-db')

const port = process.env.MQTT_PORT || 1883

const config = {
  database: process.env.DB_NAME || 'platziverse',
  username: process.env.DB_USER || 'platzi',
  password: process.env.DB_PASS || 'platzi',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: s => debug(s)
}

let Agent, Metric

server.listen(port, function () {
  debug(chalk.green(`server started and listening on port ${port}`))
})

server.on('listening', async () => {
  try {
    // Initializes Agent and Metric services
    const services = await db(config)
    Agent = services.Agent
    Metric = services.Metric
  } catch (error) {
    handleFatalError(error)
  }
})

aedes.on('client', (client) => {
  debug(chalk.green(`Client connected: ${client.id}`))
})

aedes.on('clientDisconnect', (client) => {
  debug(chalk.yellow(`Client disconnected: ${client.id}`))
})

aedes.on('publish', (packet, client) => {
  debug(chalk.yellowBright(`received: ${packet.topic}`))
  debug(chalk.yellowBright(`Payload: ${packet.payload}`))
  debug(chalk.yellowBright(`message from Client: ${client}`))
})

aedes.on('clientError', handleFatalError)

function handleFatalError (error) {
  debug(`${chalk.red('[FATAL ERROR]')} ${error.message}`)
  debug(chalk.red(`ERROR: ${error.stack}`))
  process.exit(1)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
