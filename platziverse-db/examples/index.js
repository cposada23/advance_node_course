'use strict'
const debug = require('debug')('platziverse:examples:index')
const db = require('../')

async function run () {
  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres'
  }

  const { Agent, Metric } = await db(config).catch(handleFatalError)

  const agent = await Agent.createOrUpdate({
    uuid: 'yyy',
    name: 'test',
    username: 'test',
    hostName: 'test',
    pid: 1,
    connected: true
  }).catch(handleFatalError)

  debug('--agent--')
  debug(agent)

  const agents = await Agent.findAll().catch(handleFatalError)
  debug('--agents--')
  debug(agents)

  const metrics = await Metric.findByAgentUuid(agent.uuid).catch(handleFatalError)
  debug('--metrics--')
  debug(metrics)

  const metric = await Metric.create(agent.uuid, {
    type: 'memory',
    value: '300'
  }).catch(handleFatalError)

  debug('--metric--')
  debug(metric)

  const metricsByType = await Metric.findByTypeAgentUuid('memory', agent.uuid).catch(handleFatalError)
  debug('--metrics--')
  debug(metricsByType)
}

function handleFatalError (err) {
  debug(err.message)
  debug(err.stack)
  process.exit(1)
}

run()
