const test = require('narval')

const mockery = require('./mockery')

const MODULE = 'domapic-service'

const Mock = function () {
  let sandbox = test.sinon.createSandbox()
  let resolveStartCalled

  const resolveOnStartCalledPromise = new Promise(resolve => {
    resolveStartCalled = resolve
  })

  const moduleStubs = {
    start: sandbox.stub().callsFake(() => {
      resolveStartCalled()
      return Promise.resolve()
    }),
    register: sandbox.stub(),
    events: {
      emit: sandbox.stub()
    },
    config: {
      get: sandbox.stub().resolves()
    },
    storage: {
      get: sandbox.stub().resolves(),
      set: sandbox.stub().resolves()
    },
    tracer: {
      info: sandbox.stub().resolves(),
      debug: sandbox.stub().resolves(),
      error: sandbox.stub().resolves()
    }
  }

  const stubs = {
    createModule: sandbox.stub().resolves(moduleStubs),
    cli: sandbox.stub()
  }

  const restore = () => {
    sandbox.restore()
    mockery.deregister(MODULE)
  }

  mockery.register(MODULE, stubs)

  return {
    restore,
    stubs: {
      ...stubs,
      module: moduleStubs
    },
    utils: {
      resolveOnStartCalled: () => resolveOnStartCalledPromise
    }
  }
}

module.exports = Mock
