# Gpio Out Domapic

> Handler to be used internally by Domapic Modules for controlling a gpio in \"out\" mode

[![Build status][travisci-image]][travisci-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url] [![js-standard-style][standard-image]][standard-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url]

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]

---

## Intro

This package provides a Domapic handler for controlling a relay using the [onoff][onoff-url] library internally.  Passing it a Domapic module instance, it will retrieve the module instance configuration defined when started the service, and will configure the gpio based on it.

Just define which are your module "options keys" for configuring the relay, and the handler will automatically load the configuration. Or you can also set the options with fixed values programatically.

## Installation

```bash
npm i gpio-out-domapic -save
```

## Usage

#### `new Gpio(domapicModule, [options[, configurationKeys]])`

* `options` `<object>` Object containing default values for options. Will apply these values if no configuration keys are provided.
	* `initialStatus` `<boolean>` Defines the initial status of the gpio. Default is `false`.
	* `rememberLastStatus` `<boolean>` Defines if the Gpio will save status to storage in order to remember the last one when it is restarted. Default is `false`.
	* `invert` `<boolean>` If true, the values read from or written to the GPIO should be inverted. Equivalent to the `activeLow` option of the [onoff][onoff-url] library.
* `configurationKeys` `<object>` Object defining configuration keys from which the options will be loaded.
	* `gpio` `<string>` Key defining the configuration property in which the gpio number is defined. Default is `gpio`.
	* `initialStatus` `<string>` Key defining the configuration property in which the initial status for the gpio is defined.
	* `rememberLastStatus` `<string>` Key defining the configuration property in which the rememberLastStatus option is defined.
	* `invert` `<string>` Key defining the configuration property in which the invert option is defined.


##### Instance

* `gpio.init()` `async method`. Initializes the gpio retrieving configuration, etc.
* `gpio.toggle()` `async method`. Changes the relay status inverting the current value.
* `gpio.setStatus(status)` `async method`. Changes the relay status to the provided one.
	* `status` `<boolean>` Defines the new status for the gpio.
* `gpio.status` `getter`. Returns the current gpio status.


## Example

In the next example, the `gpio-out-domapic` package is used to create a [Domapic Module][domapic-service-url] that controls a relay that can be toogled using the built-in api:

```js
const path = require('path')

const domapic = require('domapic-service')
const gpioOut = require('gpio-out-domapic')

domapic.createModule({
  packagePath: path.resolve(__dirname),
  customConfig: {
    status: {
      type: 'boolean',
      describe: 'Set initial status of the relay when module is started',
      default: false
    }
  }
}).then(async dmpcModule => {
  const relay = new gpioOut.Gpio(dmpcModule, {
    rememberLastStatus: true
  }, {
    initialStatus: 'status'
  })

  await dmpcModule.register({
    toggle: {
      description: 'Toggle relay',
      action: {
        description: 'Toggle the relay status',
        handler: async () => {
          await relay.toggle()
          return Promise.resolve()
        }
      }
    }
  })

  await relay.init()
  return dmpcModule.start()
})
```

Now, the module can be started using the `status` option, which Gpio will use as `initialStatus`:

```bash
node server.js --status=true
```

[coveralls-image]: https://coveralls.io/repos/github/javierbrea/gpio-out-domapic/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/javierbrea/gpio-out-domapic
[travisci-image]: https://travis-ci.com/javierbrea/gpio-out-domapic.svg?branch=master
[travisci-url]: https://travis-ci.com/javierbrea/gpio-out-domapic
[last-commit-image]: https://img.shields.io/github/last-commit/javierbrea/gpio-out-domapic.svg
[last-commit-url]: https://github.com/javierbrea/gpio-out-domapic/commits
[license-image]: https://img.shields.io/npm/l/gpio-out-domapic.svg
[license-url]: https://github.com/javierbrea/gpio-out-domapic/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/gpio-out-domapic.svg
[npm-downloads-url]: https://www.npmjs.com/package/gpio-out-domapic
[npm-dependencies-image]: https://img.shields.io/david/javierbrea/gpio-out-domapic.svg
[npm-dependencies-url]: https://david-dm.org/javierbrea/gpio-out-domapic
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=gpio-out-domapic&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=gpio-out-domapic
[release-image]: https://img.shields.io/github/release-date/javierbrea/gpio-out-domapic.svg
[release-url]: https://github.com/javierbrea/gpio-out-domapic/releases
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[standard-url]: http://standardjs.com/

[onoff-url]: https://www.npmjs.com/package/onoff
[domapic-service-url]: https://www.npmjs.com/package/domapic-service


