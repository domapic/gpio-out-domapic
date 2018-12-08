'use strict'

const Gpio = require('./Gpio')
const GpioMock = require('./GpioMock')

const { GPIO_KEY, booleanToLog } = require('./utils')

class GpioHandler {
  constructor (dpmcModule, options = {}, configKeys = {}) {
    this._module = dpmcModule
    this._gpioKey = configKeys.gpio || GPIO_KEY

    this._initialStatusKey = configKeys.initialStatus
    this._invertKey = configKeys.invert
    this._rememberLastStateKey = configKeys.rememberLastState

    this._defaultRememberLastState = options.rememberLastState || false
    this._defaultInitialStatus = options.initialStatus || false
    this._defaultInvert = options.invert || false
  }

  async init () {
    let initialStatus = (this._initialStatusKey && await this._module.config.get(this._initialStatusKey)) || this._defaultInitialStatus
    const invert = (this._invertKey && await this._module.config.get(this._invertKey)) || this._defaultInvert

    this._rememberLastState = (this._rememberLastStateKey && await this._module.config.get(this._rememberLastStateKey)) || this._defaultRememberLastState
    this._gpioNumber = await this._module.config.get(this._gpioKey)

    this._storageKey = `gpio_${this._gpioNumber}_state`

    if (this._rememberLastState) {
      try {
        await this._module.tracer.info(`Recovering last state of gpio ${this._gpioNumber} from storage`)
        initialStatus = await this._module.storage.get(this._storageKey)
      } catch (err) {
        await this._module.storage.set(this._storageKey, initialStatus)
      }
    }

    try {
      await this._module.tracer.info(`Initializing gpio ${this._gpioNumber}, initially ${booleanToLog(initialStatus)}, and invert option ${booleanToLog(invert)}`)
      this._gpio = new Gpio(this._gpioNumber, initialStatus, invert)
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
    await this._module.tracer.debug(`Setting gpio ${this._gpioNumber} to ${status}`)
    this._gpio.status = status
    if (this._rememberLastState) {
      await this._module.storage.set(this._storageKey, status)
    }
    return status
  }

  async toggle () {
    const newStatus = !this._gpio.status
    return this.setStatus(newStatus)
  }
}

module.exports = GpioHandler
