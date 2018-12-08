'use strict'

const GPIO = 'gpio'
const INITIAL_STATUS = 'initialStatus'
const INVERT = 'invert'
const BOOLEAN_LOGS = {
  'false': 'disabled',
  'true': 'enabled'
}
const booleanToLog = status => BOOLEAN_LOGS[status.toString()]

module.exports = {
  GPIO,
  INITIAL_STATUS,
  INVERT,
  booleanToLog
}
