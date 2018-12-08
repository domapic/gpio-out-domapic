const test = require('narval')

const DomapicMocks = require('../Domapic.mocks')
const GpioMocks = require('./Gpio.mocks')
const GpioMockMocks = require('./GpioMock.mocks')

test.describe('Gpio Handler', () => {
  let GpioHandler
  let gpioHandler
  let domapicMocks
  let gpioMocks
  let gpioMockMocks

  test.beforeEach(() => {
    gpioMocks = new GpioMocks()
    gpioMockMocks = new GpioMockMocks()
    domapicMocks = new DomapicMocks()
    GpioHandler = require('../../lib/GpioHandler')
  })

  test.afterEach(() => {
    domapicMocks.restore()
    gpioMocks.restore()
    gpioMockMocks.restore()
  })

  test.it('should set initial status key as "initialStatus" if option is not received', () => {
    gpioHandler = new GpioHandler(domapicMocks.stubs.module)
    test.expect(gpioHandler._initialStatusKey).to.equal('initialStatus')
  })

  test.it('should set gpio key as "gpio" if option is not received', () => {
    gpioHandler = new GpioHandler(domapicMocks.stubs.module)
    test.expect(gpioHandler._gpioKey).to.equal('gpio')
  })

  test.it('should set invert key as "invertKey" if option is not received', () => {
    gpioHandler = new GpioHandler(domapicMocks.stubs.module)
    test.expect(gpioHandler._invertKey).to.equal('invert')
  })

  test.it('should set default initial status as false if option is not received', () => {
    gpioHandler = new GpioHandler(domapicMocks.stubs.module)
    test.expect(gpioHandler._defaultInitialStatus).to.equal(false)
  })

  test.describe('init method', () => {
    test.beforeEach(() => {
      domapicMocks.stubs.module.storage.get.resolves(true)
      domapicMocks.stubs.module.config.get.resolves(true)
    })

    test.describe('when creating new gpio handler', async () => {
      test.it('should set the initial status from storage, using the key defined in options', async () => {
        const fooStatus = false
        domapicMocks.stubs.module.storage.get.resolves(fooStatus)
        const initialStatusKey = 'fooStatusKey'
        gpioHandler = new GpioHandler(domapicMocks.stubs.module, {
          initialStatusKey
        })
        await gpioHandler.init()
        test.expect(domapicMocks.stubs.module.storage.get).to.have.been.calledWith(initialStatusKey)
        test.expect(gpioMocks.stubs.Constructor.getCall(0).args[1]).to.equal(fooStatus)
      })

      test.it('should set the initial status from config if storage throws an error', async () => {
        const fooStatus = false
        domapicMocks.stubs.module.storage.get.rejects(new Error())
        domapicMocks.stubs.module.config.get.resolves(fooStatus)
        gpioHandler = new GpioHandler(domapicMocks.stubs.module)
        await gpioHandler.init()
        test.expect(gpioMocks.stubs.Constructor.getCall(0).args[1]).to.equal(fooStatus)
      })

      test.it('should set the gpio number from config, getting it from defined gpioKey', async () => {
        const fooGpio = 15
        const gpioKey = 'fooGpioKey'
        domapicMocks.stubs.module.config.get.resolves(fooGpio)
        gpioHandler = new GpioHandler(domapicMocks.stubs.module, {
          gpioKey
        })
        await gpioHandler.init()
        test.expect(domapicMocks.stubs.module.config.get).to.have.been.calledWith(gpioKey)
        test.expect(gpioMocks.stubs.Constructor.getCall(0).args[0]).to.equal(fooGpio)
      })

      test.it('should set the invert option from config, getting it from defined invertKey', async () => {
        const fooInvert = false
        const invertKey = 'fooInvertKey'
        domapicMocks.stubs.module.config.get.resolves(fooInvert)
        gpioHandler = new GpioHandler(domapicMocks.stubs.module, {
          invertKey
        })
        await gpioHandler.init()
        test.expect(domapicMocks.stubs.module.config.get).to.have.been.calledWith(invertKey)
        test.expect(gpioMocks.stubs.Constructor.getCall(0).args[2]).to.equal(fooInvert)
      })

      test.it('should init a virtual gpio passing the status if real gpio initialization throws an error', async () => {
        const fooStatus = false
        domapicMocks.stubs.module.storage.get.resolves(fooStatus)
        gpioMocks.stubs.Constructor.throws(new Error())
        gpioHandler = new GpioHandler(domapicMocks.stubs.module)
        await gpioHandler.init()
        test.expect(gpioMockMocks.stubs.Constructor.getCall(0).args[0]).to.equal(fooStatus)
      })
    })
  })

  test.describe('status methods', () => {
    test.beforeEach(async () => {
      domapicMocks.stubs.module.storage.get.resolves(true)
      domapicMocks.stubs.module.config.get.resolves(true)
      gpioHandler = new GpioHandler(domapicMocks.stubs.module)
      await gpioHandler.init()
    })

    test.describe('status getter', () => {
      test.it('should return current gpio status', async () => {
        const fooStatus = 'foo-status'
        gpioMocks.stubs.instance.status = fooStatus
        test.expect(gpioHandler.status).to.equal(fooStatus)
      })
    })

    test.describe('setStatus method', () => {
      test.it('should set gpio status', async () => {
        const fooStatus = 'foo-status'
        await gpioHandler.setStatus(fooStatus)
        test.expect(gpioMocks.stubs.instance.status).to.equal(fooStatus)
      })

      test.it('should save status to storage', async () => {
        const fooStatus = 'foo-status'
        await gpioHandler.setStatus(fooStatus)
        test.expect(domapicMocks.stubs.module.storage.set.getCall(0).args[1]).to.equal(fooStatus)
      })
    })

    test.describe('toggle method', () => {
      test.it('should set gpio status to true if current status is false', async () => {
        gpioMocks.stubs.instance.status = false
        await gpioHandler.toggle()
        test.expect(gpioMocks.stubs.instance.status).to.equal(true)
      })

      test.it('should set gpio status to false if current status is true', async () => {
        gpioMocks.stubs.instance.status = true
        await gpioHandler.toggle()
        test.expect(gpioMocks.stubs.instance.status).to.equal(false)
      })
    })
  })
})
