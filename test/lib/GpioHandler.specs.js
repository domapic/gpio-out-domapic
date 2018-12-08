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

  test.it('should set gpio key as "gpio" if configKey is not received', () => {
    gpioHandler = new GpioHandler(domapicMocks.stubs.module)
    test.expect(gpioHandler._gpioKey).to.equal('gpio')
  })

  test.it('should set gpio key if configKey is received', () => {
    gpioHandler = new GpioHandler(domapicMocks.stubs.module, {}, {
      gpio: 'foo-gpio'
    })
    test.expect(gpioHandler._gpioKey).to.equal('foo-gpio')
  })

  test.it('should set default initial status as false if option is not received', () => {
    gpioHandler = new GpioHandler(domapicMocks.stubs.module)
    test.expect(gpioHandler._defaultInitialStatus).to.equal(false)
  })

  test.it('should set default initial status if option is received', () => {
    gpioHandler = new GpioHandler(domapicMocks.stubs.module, {
      initialStatus: true
    }, {})
    test.expect(gpioHandler._defaultInitialStatus).to.equal(true)
  })

  test.it('should set default rememberLastState as false if option is not received', () => {
    gpioHandler = new GpioHandler(domapicMocks.stubs.module)
    test.expect(gpioHandler._defaultRememberLastState).to.equal(false)
  })

  test.it('should set default rememberLastState if option is received', () => {
    gpioHandler = new GpioHandler(domapicMocks.stubs.module, {
      rememberLastState: true
    }, {})
    test.expect(gpioHandler._defaultRememberLastState).to.equal(true)
  })

  test.it('should set default invert as false if option is not received', () => {
    gpioHandler = new GpioHandler(domapicMocks.stubs.module)
    test.expect(gpioHandler._defaultInvert).to.equal(false)
  })

  test.it('should set default invert if option is received', () => {
    gpioHandler = new GpioHandler(domapicMocks.stubs.module, {
      invert: true
    }, {})
    test.expect(gpioHandler._defaultInvert).to.equal(true)
  })

  test.describe('init method', () => {
    test.beforeEach(() => {
      domapicMocks.stubs.module.storage.get.resolves(true)
      domapicMocks.stubs.module.config.get.resolves(true)
    })

    test.describe('when creating new gpio handler', async () => {
      test.it('should set the gpio number from config, getting it from defined gpioKey', async () => {
        const fooGpio = 15
        const gpioKey = 'fooGpioKey'
        domapicMocks.stubs.module.config.get.resolves(fooGpio)
        gpioHandler = new GpioHandler(domapicMocks.stubs.module, {
        }, {
          gpio: gpioKey
        })
        await gpioHandler.init()
        test.expect(domapicMocks.stubs.module.config.get).to.have.been.calledWith(gpioKey)
        test.expect(gpioMocks.stubs.Constructor.getCall(0).args[0]).to.equal(fooGpio)
      })

      test.describe('when has an initialStatus configuration key defined', () => {
        test.it('should set the initialStatus option from config, getting it from defined initialStatus key', async () => {
          const fooValue = false
          const key = 'fooInitialStatusKey'
          domapicMocks.stubs.module.config.get.resolves(fooValue)
          gpioHandler = new GpioHandler(domapicMocks.stubs.module, {
          }, {
            initialStatus: key
          })
          await gpioHandler.init()
          test.expect(domapicMocks.stubs.module.config.get).to.have.been.calledWith(key)
          test.expect(gpioMocks.stubs.Constructor.getCall(0).args[1]).to.equal(fooValue)
        })
      })

      test.describe('when has an invert configuration key defined', () => {
        test.it('should set the invert option from config, getting it from defined invert key', async () => {
          const fooValue = false
          const key = 'fooInvertKey'
          domapicMocks.stubs.module.config.get.resolves(fooValue)
          gpioHandler = new GpioHandler(domapicMocks.stubs.module, {
          }, {
            invert: key
          })
          await gpioHandler.init()
          test.expect(domapicMocks.stubs.module.config.get).to.have.been.calledWith(key)
          test.expect(gpioMocks.stubs.Constructor.getCall(0).args[2]).to.equal(fooValue)
        })
      })

      test.describe('when has a rememberLastState configuration key defined', () => {
        test.it('should set the rememberLastState option from config, getting it from defined rememberLastState key', async () => {
          const fooValue = false
          const key = 'fooLasStateKey'
          domapicMocks.stubs.module.config.get.resolves(fooValue)
          gpioHandler = new GpioHandler(domapicMocks.stubs.module, {
          }, {
            rememberLastState: key
          })
          await gpioHandler.init()
          test.expect(domapicMocks.stubs.module.config.get).to.have.been.calledWith(key)
        })
      })

      test.describe('when rememberLastSate option is true', () => {
        test.it('should set the initial status from storage, with a key containing the gpio number', async () => {
          const fooStatus = false
          domapicMocks.stubs.module.storage.get.resolves(fooStatus)
          const initialStatusKey = 'fooStatusKey'
          gpioHandler = new GpioHandler(domapicMocks.stubs.module, {
            rememberLastState: true
          }, {
            initialStatus: initialStatusKey
          })
          await gpioHandler.init()
          test.expect(domapicMocks.stubs.module.storage.get).to.have.been.calledWith(`gpio_${gpioHandler._gpioNumber}_state`)
          test.expect(gpioMocks.stubs.Constructor.getCall(0).args[1]).to.equal(fooStatus)
        })

        test.it('should set the initial status from config if storage throws an error', async () => {
          const fooStatus = false
          domapicMocks.stubs.module.storage.get.rejects(new Error())
          domapicMocks.stubs.module.config.get.resolves(fooStatus)
          gpioHandler = new GpioHandler(domapicMocks.stubs.module, {
            rememberLastState: true
          })
          await gpioHandler.init()
          test.expect(gpioMocks.stubs.Constructor.getCall(0).args[1]).to.equal(fooStatus)
        })
      })

      test.describe('when rememberLastSate option is false', () => {
        test.it('should not set the initial status from storage', async () => {
          gpioHandler = new GpioHandler(domapicMocks.stubs.module, {
            rememberLastState: false,
            initialStatus: true
          })
          await gpioHandler.init()
          test.expect(domapicMocks.stubs.module.storage.get).to.not.have.been.called()
          test.expect(gpioMocks.stubs.Constructor.getCall(0).args[1]).to.equal(true)
        })
      })

      test.it('should init a virtual gpio passing the status if real gpio initialization throws an error', async () => {
        const fooStatus = false
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

      test.describe('when rememberLastState is true', () => {
        test.it('should save status to storage', async () => {
          const fooStatus = 'foo-status'
          gpioHandler._rememberLastState = true
          await gpioHandler.setStatus(fooStatus)
          test.expect(domapicMocks.stubs.module.storage.set.getCall(0).args[1]).to.equal(fooStatus)
        })
      })

      test.describe('when rememberLastState is false', () => {
        test.it('should not save status to storage', async () => {
          const fooStatus = 'foo-status'
          gpioHandler._rememberLastState = false
          await gpioHandler.setStatus(fooStatus)
          test.expect(domapicMocks.stubs.module.storage.set).to.not.have.been.called()
        })
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
