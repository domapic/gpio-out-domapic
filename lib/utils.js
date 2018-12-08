'use strict'

const GPIO_KEY = 'gpio'
const BOOLEAN_LOGS = {
  'false': 'disabled',
  'true': 'enabled'
}
const booleanToLog = status => BOOLEAN_LOGS[status.toString()]

module.exports = {
  GPIO_KEY,
  booleanToLog
}
