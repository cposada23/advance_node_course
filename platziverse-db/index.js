'use strict'

const setupDatabase = require('./lib/db')
const setupAgentModel = require('./models/agent.model')
const setupMetricModel = require('./models/metric.model')
const setupMetric = require('./lib/metric.service')
const setupAgent = require('./lib/agent.service')
const defaults = require('defaults')

module.exports = async function (config) {
  config = defaults(config, {
    dialect: 'sqlite', // Si estas propiedades no estan definidas le digo que tome estas por defecto
    pool: {
      max: 10,
      min: 0,
      idle: 10000
    },
    query: {
      raw: true
    }
  })

  const sequelize = setupDatabase(config)
  const AgentModel = setupAgentModel(config)
  const MetricModel = setupMetricModel(config)

  AgentModel.hasMany(MetricModel)
  MetricModel.belongsTo(AgentModel)

  // Validar que la base de datos este bien configurada
  await sequelize.authenticate() // hace una pequeña query de conexión a la base de datos para saber si si se pudo realizar correctamente la conexión

  // sequelize.sync() // Si no existen los modelos en la base de datos sequelize automamticamente los va a crear

  if (config.setup) {
    await sequelize.sync({ force: true }) // Ojo, sincronizo la base de datos ( Creo la base de datos en el servidor ) Force: true, si la base de datos existe la borra y crea una nueva ojo
  }

  const Agent = setupAgent(AgentModel)
  const Metric = setupMetric(MetricModel, AgentModel)

  return {
    Agent,
    Metric
  }
}
