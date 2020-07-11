'use strict'

const metric = {
  id: 1,
  type: 'cpu',
  value: 'valor de la metrica'
}

const metricas = [
  metric,
  { id: 2, type: 'ram', value: '2gb' },
  { id: 3, type: 'cores', value: '2 cores' },
  { id: 4, type: 'free space', value: '1 Tera' }
]

module.exports = {
  singleMetric: metric,
  all: metricas
}
