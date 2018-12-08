const test = require('narval')

const OnoffMocks = require('./Onoff.mocks')
const DeathMocks = require('./Death.mocks')

test.describe('Gpio', () => {
  let Gpio
  let gpio
  let onoffMocks
  let deathMocks

  test.beforeEach(() => {
    onoffMocks = new OnoffMocks()
    deathMocks = new DeathMocks()
    Gpio = require('../../lib/Gpio')
  })

  test.afterEach(() => {
    deathMocks.restore()
    onoffMocks.restore()
  })

  test.it('should throw an error if gpio is not accesible', () => {
    let error
    onoffMocks.stubs.Gpio.accessible = false
    try {
      gpio = new Gpio()
    } catch (err) {
      error = err
    }
    test.expect(gpio).to.be.undefined()
    test.expect(error.message).to.contain('not accesible')
  })

  test.it('should create a Gpio passing gpioNumber', () => {
    const gpioNumber = 3
    gpio = new Gpio(gpioNumber, false, true)
    test.expect(onoffMocks.stubs.Gpio.getCall(0).args[0]).to.equal(gpioNumber)
  })

  test.it('should create a Gpio passing "low" as initial status if false is received', () => {
    gpio = new Gpio(2, false, true)
    test.expect(onoffMocks.stubs.Gpio.getCall(0).args[1]).to.equal('low')
  })

  test.it('should create a Gpio passing "high" as initial status if true is received', () => {
    gpio = new Gpio(2, true, true)
    test.expect(onoffMocks.stubs.Gpio.getCall(0).args[1]).to.equal('high')
  })

  test.it('should create a Gpio passing true as activeLow option if invert is true', () => {
    gpio = new Gpio(2, true, true)
    test.expect(onoffMocks.stubs.Gpio.getCall(0).args[2].activeLow).to.equal(true)
  })

  test.it('should create a Gpio passing false as activeLow option if invert is false', () => {
    gpio = new Gpio(2, true, false)
    test.expect(onoffMocks.stubs.Gpio.getCall(0).args[2].activeLow).to.equal(false)
  })

  test.it('should have added an onDeath callback', () => {
    gpio = new Gpio(2, true, false)
    test.expect(deathMocks.stub).to.have.been.called()
  })

  test.describe('when process is death', () => {
    let sandbox
    test.beforeEach(() => {
      sandbox = test.sinon.createSandbox()
      sandbox.stub(process, 'exit')
    })

    test.afterEach(() => {
      sandbox.restore()
    })

    test.it('should call to unexport gpio', () => {
      gpio = new Gpio(2, true, false)
      deathMocks.stub.callBack()
      test.expect(onoffMocks.stubs.gpio.unexport).to.have.been.called()
    })

    test.it('should not call to unexport gpio if method is not available', () => {
      const originalStub = onoffMocks.stubs.gpio.unexport
      gpio = new Gpio(2, true, false)
      onoffMocks.stubs.gpio.unexport = false
      deathMocks.stub.callBack()
      test.expect(originalStub).to.not.have.been.called()
    })

    test.it('should call to process exit', () => {
      gpio = new Gpio(2, true, false)
      deathMocks.stub.callBack()
      test.expect(process.exit).to.have.been.called()
    })
  })

  test.describe('status setter', () => {
    test.it('should call to onoff writeSync method with 1 if status is true', () => {
      gpio = new Gpio(2, true, false)
      gpio.status = true
      test.expect(onoffMocks.stubs.gpio.writeSync).to.have.been.calledWith(1)
    })

    test.it('should call to onoff writeSync method with 0 if status is false', () => {
      gpio = new Gpio(2, true, false)
      gpio.status = false
      test.expect(onoffMocks.stubs.gpio.writeSync).to.have.been.calledWith(0)
    })
  })

  test.describe('status getter', () => {
    test.it('should call to onoff readSync method, and return true if value is 1', () => {
      onoffMocks.stubs.gpio.readSync.returns(1)
      gpio = new Gpio(2, true, false)
      const value = gpio.status
      test.expect(value).to.equal(true)
    })

    test.it('should call to onoff readSync method, and return false if value is 0', () => {
      onoffMocks.stubs.gpio.readSync.returns(0)
      gpio = new Gpio(2, true, false)
      const value = gpio.status
      test.expect(value).to.equal(false)
    })
  })
})
