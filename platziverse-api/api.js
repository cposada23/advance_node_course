'use strict'

const debug = require('debug')('platziverse:api:api')
const express = require('express')
const db = require('platziverse-db')

const config = require('./config')

const api = express.Router()

let services, Agent, Metric

api.use('*', async (req, res, next) => {
  debug('midleware')
  if (!services) {
    try {
      services = await db(config.db)
      debug('connected')
      Agent = services.Agent
      Metric = services.Metric
    } catch (error) {
      return next(error)
    }
  }
  next()
})

api.get('/agents', async (req, res, next) => {
  debug('request to /agents')

  let agents = []
  
  try {
    agents = await Agent.findConnected()
  }catch(error) {
    return next(error)
  }
  
  res.send(agents)
})

api.get('/agent/:uuid', async (req, res, next) => {
  const { uuid } = req.params
  debug(`Requested agent with uuid: ${uuid}`)

  let agent
  try {
    agent = await Agent.findByUuid(uuid)
  }catch (error) {
    return next(error)
  }

  if(!agent) {
    return next(new Error(`Agent not found with uuid ${uuid}`))
  }

  res.send(agent)
})

api.get('/metrics/:uuid',async (req, res, next) => {

  const { uuid } = req.params
  debug(`request /metric/${uuid}`)

  let metrics = []

  try {
    metrics = await Metric.findByAgentUuid(uuid)
  }catch(error) {
    return next(error)
  }

  if(!metrics || metrics.length === 0) {
    return next(new Error(`Metics not found for agent with uuid ${uuid}`))
  }

  res.send(metrics)
})

api.get('/metrics/:uuid/:type', async (req, res) => {
  const { uuid, type } = req.params
  debug(`request /metric/${uuid}/${type}`)

  let metrics = []

  try {
    metrics = await Metric.findByTypeAgentUuid(type, uuid)
  }catch(error) {
    return next(error)
  }


  if(!metrics || metrics.length === 0) {
    return next(new Error(`Metics not found for agent with uuid ${uuid} with type: ${type}`))
  }


  res.send(metrics)
})

module.exports = api
