'use strict'

const debug = require('debug')('platziverse:mqtt:server')
const chalk = require('chalk')
const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
const db = require('platziverse-db')

// utils
const { parsePayload } = require('./utils')

const port = process.env.MQTT_PORT || 1883

const config = {
  database: process.env.DB_NAME || 'platziverse',
  username: process.env.DB_USER || 'platzi',
  password: process.env.DB_PASS || 'platzi',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: s => debug(s)
}

// Constantes
const topicAgentConnected = 'agent/connected'
const topicAgentDisconnected = 'agent/disconnected'
const topicAgentMessage = 'agent/message'

let Agent, Metric
const clients = new Map()

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
  clients.set(client.id, null)
})

aedes.on('clientDisconnect', async (client) => {
  debug(chalk.yellow(`Client disconnected: ${client.id}`))
  const agent = clients.get(client.id)
  if (agent) {
    // marcar como desconectado
    agent.connected = false
    try {
      await Agent.createOrUpdate(agent)
    } catch(error) {
      return handleError(error)
    }

    clients.delete(client.id)

    aedes.publish({
      topic: topicAgentDisconnected,
      payload: JSON.stringify({
        agent: {
          uuid: agent.uuid
        }
      })
    })

    debug(`Client ${client.id} associeated to Agent ${agent.uuid} marked as disconnected`)
  }
})

aedes.on('publish', async (packet, client) => {
  debug(chalk.yellowBright(`received: ${packet.topic}`))
  switch (packet.topic) {
    case topicAgentConnected:
    case topicAgentDisconnected:
      debug(`payload: ${packet.payload}`)
      break
    case topicAgentMessage:
      debug(`payload: ${packet.payload}`)
      const payload = parsePayload(packet.payload)
      if (payload) {
        payload.agent.connected = true
        let agent
        try {
          agent = await Agent.createOrUpdate(payload.agent)
        } catch (error) {
          return handleError(error)
        }
        debug(`Agent ${agent.uuid} saved`)

        if (!clients.get(client.id)) {
          client.set(client.id, agent)
          aedes.publish({
            topic: topicAgentConnected,
            payload: JSON.stringify({
              agent: {
                uuid: agent.uuid,
                name: agent.name,
                hostName: agent.hostName,
                pid: agent.pid,
                connected: agent.connected
              }
            })
          })
        }

        // Almacenar las metricas
        for (let metric of payload.metrics ) {
          let m

          try {
            m = await Metric.create(agent.uuid, metric)
          }catch(error) {
            return handleError(error)
          }
          debug(`Metric ${m.id} saved on agent ${agent.uuid}`)
        }
      }
      break
  }
  debug(chalk.yellowBright(`Payload: ${packet.payload}`))
})

aedes.on('clientError', handleFatalError)

function handleFatalError (error) {
  debug(`${chalk.red('[FATAL ERROR]')} ${error.message}`)
  debug(chalk.red(`ERROR: ${error.stack}`))
  process.exit(1)
}

function handleError (error) {
  debug(`${chalk.red('[ERROR]')} ${error.message}`)
  debug(chalk.red(`ERROR: ${error.stack}`))
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
