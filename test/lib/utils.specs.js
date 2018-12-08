const test = require('narval')

const utils = require('../../lib/utils')

test.describe('utils', () => {
  test.describe('booleanToLog', () => {
    test.it('should return "disabled" if received false', () => {
      test.expect(utils.booleanToLog(false)).to.equal('disabled')
    })

    test.it('should return "enabled" if received true', () => {
      test.expect(utils.booleanToLog(true)).to.equal('enabled')
    })
  })
})
