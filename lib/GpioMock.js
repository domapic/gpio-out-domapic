'use strict'

class GpioMock {
  constructor (initialStatus) {
    this._status = initialStatus
  }

  set status (status) {
    this._status = status
  }

  get status () {
    return this._status
  }
}

module.exports = GpioMock
