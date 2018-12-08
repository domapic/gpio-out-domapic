const test = require('narval')

const GpioMock = require('../../lib/GpioMock')

test.describe('Gpio Mock', () => {
  test.it('should set the initial status', () => {
    const fooStatus = true
    const gpioMock = new GpioMock(fooStatus)
    test.expect(gpioMock.status).to.equal(fooStatus)
  })

  test.it('should set the status', () => {
    const fooStatus = true
    const fooNewStatus = false
    const gpioMock = new GpioMock(fooStatus)
    gpioMock.status = fooNewStatus
    test.expect(gpioMock.status).to.equal(fooNewStatus)
  })
})
