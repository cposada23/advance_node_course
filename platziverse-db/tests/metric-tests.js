'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

// Fixtures
const agentFixtures = require('./fixtures/agent.fixture')
const metricFixtures = require('./fixtures/metric.fixture')

const config = {
  logging: function () {}
}

const singleAgent = Object.assign({}, agentFixtures.single)
const singleMetric = Object.assign({}, metricFixtures.singleMetric)

let db = null
let sandbox = null
let uuid = singleAgent.uuid


const uuidArgs = {
  where: {
    uuid: singleAgent.uuid
  }
}


// Stubs
let AgentStub = null
let MetricStub = null



let metricUuidArgs = {
  attributes: ['type'],
  group: ['type'],
  include: [{
    attributes: [],
    model: AgentStub,
    where: {
      uuid
    }
  }],
  raw: true
}; 

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  MetricStub = {
    belongsTo: sandbox.spy()
  }
  AgentStub = {
    hasMany: sandbox.spy()
  }

   // Model findOne Stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))
 
  metricUuidArgs.include[0].model = AgentStub;
  // Model metric create - stub
  MetricStub.create = sandbox.stub()
  MetricStub.create.withArgs(singleMetric).returns(Promise.resolve({
    toJSON () { return singleMetric }
  }))

  // Model metric  findAll  - Stub
  MetricStub.findAll = sandbox.stub()
  console.log(metricUuidArgs)
  MetricStub.findAll.withArgs(metricUuidArgs).returns(Promise.resolve(metricFixtures.all))
  
  const setupDatabase = proxyquire('../', {
    './models/agent.model': () => AgentStub,
    './models/metric.model': () => MetricStub
  })
  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sinon.restore()
})

test('Metric:Agent#Services', t => {
  t.truthy(db.Agent, 'Agent service should exist')
  t.truthy(db.Metric, 'Metric service should exist')
})

test.serial('Metric#Create', async t => {
  const metric = await db.Metric.create(singleAgent.uuid, singleMetric)

  t.true(AgentStub.findOne.called, 'findOne should be called')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(AgentStub.findOne.calledWith({
    where: { uuid: singleAgent.uuid }
  }), 'findOne should be called with uuid args')

  t.deepEqual(metric, singleMetric, 'metric should be the same')
})



test.serial('Metric#findByAgentUuid', async t => {
  const metrics = await db.Metric.findByAgentUuid(singleAgent.uuid)

  t.true(MetricStub.findAll.called, 'findAll should be called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(MetricStub.findAll.calledWith(metricUuidArgs), 'findAll should be called with uuid')
  t.is(metrics.length, metricFixtures.all.length, 'metrics should be the same amount')
  t.deepEqual(metrics, metricFixtures.all, 'metrics should be the same')
})
