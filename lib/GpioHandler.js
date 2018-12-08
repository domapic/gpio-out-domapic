'use strict'

const Gpio = require('./Gpio')
const GpioMock = require('./GpioMock')

const { GPIO, INITIAL_STATUS, INVERT, booleanToLog } = require('./utils')

class GpioHandler {
  constructor (dpmcModule, options = {}) {
    this._module = dpmcModule
    this._gpioKey = options.gpioKey || GPIO
    this._initialStatusKey = options.initialStatusKey || INITIAL_STATUS
    this._invertKey = options.invertKey || INVERT
    this._defaultInitialStatus = options.initialStatus || false
  }

  async init () {
    let initialStatus
    const gpioNumber = await this._module.config.get(this._gpioKey)
    const initialStatusConfig = await this._module.config.get(this._initialStatusKey) || this._defaultInitialStatus
    this._gpio = gpioNumber

    try {
      initialStatus = await this._module.storage.get(this._initialStatusKey)
    } catch (err) {
      initialStatus = initialStatusConfig
      await this._module.storage.set(this._initialStatusKey, initialStatus)
    }
    const invert = await this._module.config.get(this._invertKey)

    try {
      await this._module.tracer.info(`Initializing gpio ${gpioNumber}, initially ${booleanToLog(initialStatus)}, and invert option ${booleanToLog(invert)}`)
      this._gpio = new Gpio(gpioNumber, initialStatus, invert)
    } catch (error) {
      await this._module.tracer.error('Error initializing gpio. Ensure that your system supports gpios programmatically', error)
      await this._module.tracer.info(`Inititalizing virtual gpio, initially ${booleanToLog(initialStatus)}`)
      this._gpio = new GpioMock(initialStatus)
    }
  }

  get status () {
    return this._gpio.status
  }

  async setStatus (status) {
    await this._module.tracer.debug(`Setting gpio ${this._gpio} to ${status}`)
    this._gpio.status = status
    await this._module.storage.set(this._initialStatusKey, status)
    return status
  }

  async toggle () {
    const newStatus = !this._gpio.status
    return this.setStatus(newStatus)
  }
}

module.exports = GpioHandler
