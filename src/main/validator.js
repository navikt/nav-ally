const SeleniumWebDriver = require('selenium-webdriver');

const Chrome = require('selenium-webdriver/chrome');

const Firefox = require('selenium-webdriver/firefox');

const AxeBuilder = require('axe-webdriverjs');

const chromedriver = require('chromedriver');
process.env.chromedriver = chromedriver.path;

if (moduleExists('geckodriver')) {
  const geckodriver = require('geckodriver');
  process.env.geckodriver = geckodriver.path;
}

const Until = SeleniumWebDriver.until;

const By = SeleniumWebDriver.By;
const {log, error} = require('./log/log');
const Report = require('./reports/report');
const path = require('path');
const inputLoader = require('./inputs/InputLoader');

const {
  DEBUG,
  CHROME_BINARY,
  FIREFOX_BINARY,
  TAGS,
  TIMEOUT,
  ASSERT_WARNINGS,
  WAIT_TIMEOUT,
  HEADLESS,
  BROWSER,
  DETAILED_REPORT,
  DEFINITION_FILE
} = require('./globals/index');

const defaultConfig = {
  defaultBrowser: BROWSER,
  headless: inputLoader.getBooleanValue(HEADLESS, 'HEADLESS'),
  detailedReport: inputLoader.getBooleanValue(
    DETAILED_REPORT,
    'DETAILED_REPORT'
  ),
  timeout: TIMEOUT,
  waitTimeout: WAIT_TIMEOUT,
  tags: TAGS.split(',')
};

// selenium 3.6 promise manager is deprecated,
// disabling means we'll use native promises.
SeleniumWebDriver.promise.USE_PROMISE_MANAGER = false;

/**
 * @public
 * @class Validator
 *
 * @param inputFile A Javascript array with a list of links and their options.
 * @param userConfig Optional user configuration that, if set, overrides default config with user configuration.
 *
 * @example <caption>Config</caption>
 * defaultBrowser: The default browser to start if none is configured by the user
 * headless: True or false value to run in headless mode or not
 * timeout: Browser time in ms
 * waitTimeout: Timeout in ms for Selenium and WebDrivers wait(..) command.
 * tags: The aXe tags and/or rules that the validator should run.
 *
 * @constructor
 */
function Validator(inputFile, userConfig) {
  this.inputFile =
    inputFile || inputLoader.loadInputFromEnvironment(DEFINITION_FILE);

  const config = userConfig ? {...defaultConfig, ...userConfig} : defaultConfig;
  this.config = config;

  this.defaultBrowserName = config.defaultBrowser.toLowerCase();
  this.headlessBrowser = config.headless;

  // internal reference to browser, lazy loaded when needed
  this.browser = undefined;

  // caching browser windows
  this.browsers = [];

  this.scriptTimeout = config.timeout;
  this.waitTimeout = config.waitTimeout;

  // will be populated with validation results
  this.results = [];

  // uses the default set of tags (the recommended way) to run aXe
  this.tags = config.tags;

  if (DEBUG) printDebugInfo();
}

/**
 * Run validation on a given set of pages in a synchronized
 * manner, then return the results.
 */
Validator.prototype.run = function(printToConsole = true) {
  const self = this;
  console.time('validation execution time');
  return new Promise(function(resolve) {
    self.__validate(self.inputFile.links, () => resolve());
  })
    .then(() => {
      return this.closeAllBrowsers();
    })
    .then(() => {
      if (printToConsole) {
        self.printReportToConsole(self.config.detailedReport);
        console.timeEnd('validation execution time');
        log('\n');
      }
    })
    .then(function() {
      return self.results;
    });
};

/**
 * Internal validation executor that triggers Axe.
 * Users must call the run(..) function, not this .
 *
 * @param pages A list of pages to validate.
 * @param resolve A reference to a callback function to
 * finalize the execution.
 *
 */
Validator.prototype.__validate = async function(pages, resolve) {
  await this.__foreachAsync(pages, 0, resolve);
};

/**
 * This loop is compatible with Node 8 and above.
 * It uses complex async/await.
 * @private
 */
Validator.prototype.__foreachAsync = async function(pages, index, resolve) {
  const self = this;

  // stop the recursion when all pages are validated
  if (index >= pages.length) {
    resolve();
    return;
  }

  const results = this.results;
  const tags = this.tags;
  let page = pages[index];
  const options = page.options;

  let testBrowser = this.startNewBrowser(options);

  log('Setting browser timeout (ms): ' + this.scriptTimeout);
  await this.setTimeout(testBrowser, this.scriptTimeout);

  if (options && options.auth) {
    try {
      await this.__authenticate(testBrowser, options.auth, page.link);
    } catch (err) {
      this.__exit(1, {
        msg: 'An error occurred while trying to authenticate page.',
        err
      });
    }
  }

  log('Loading page: ' + (page.desc || page.link));
  try {
    await testBrowser.get(page.link);
    await testBrowser.sleep(3000);
  } catch (err) {
    this.__exit(1, {msg: 'An error occurred while trying to load page.', err});
  }

  log('Preforming pre-validation commands.');
  try {
    if (options && options.commands) {
      await this.__commands(testBrowser, options.commands);
    }
  } catch (err) {
    this.__exit(1, {
      msg: 'An error occurred while trying to run pre-validation tasks.',
      err
    });
  }

  const disabledRules =
    options && options.ignoreRules ? options.ignoreRules.split(',') : [];
  // disabledRules.push("css-orientation-is-not-locked"); // consider disabling this rule

  const vtags = options && options.tags ? options.tags.split(',') : tags;
  log('Running UU validation with tags: ' + vtags); // + ", without rules: " + disabledRules);

  try {
    new AxeBuilder(testBrowser)
      .withTags(vtags)
      .disableRules(disabledRules)
      .analyze()
      .then(pageResults => {
        results.push({
          link: page.link,
          desc: page.desc,
          options,
          result: pageResults
        });
        self.__foreachAsync(pages, index + 1, resolve);
      })
      .catch(err => {
        self.__exit(1, {
          msg: 'An error occurred while running the validator.',
          err
        });
      });
  } catch (err) {
    this.__exit(1, {
      msg: 'An error occurred while running the validator.',
      err
    });
  }
};

/**
 * Starts a completely new browser.
 *
 * @param options Extra options set in the definition file.
 * @returns {SeleniumWebDriver} A new WebDriver-browser.
 */
Validator.prototype.startNewBrowser = function(options) {
  if (options && options.browser) {
    const overriddenBrowser = options.browser.toLowerCase();
    let newBrowser = {};
    if (overriddenBrowser === 'chrome')
      newBrowser = this.createChrome(this.headlessBrowser);
    if (overriddenBrowser === 'firefox')
      newBrowser = this.createFirefox(this.headlessBrowser);
    this.__addBrowser(newBrowser, overriddenBrowser);
    return newBrowser;
  } else {
    let newCachedBrowser = this.createDefaultBrowser(this.headlessBrowser);
    this.__addBrowser(newCachedBrowser, this.defaultBrowserName);
    return newCachedBrowser;
  }
};

/**
 * Add a browser to the cache.
 *
 * @param browser The browser object
 * @param browserName Name of the browser used as key.
 */
Validator.prototype.__addBrowser = function(browser, browserName) {
  this.browsers.push({
    name: browserName,
    binary: browser
  });
};

/**
 * Constructs a new Chrome browser
 *
 * @param headless If true, creates a headless browser.
 * @returns {!ThenableWebDriver}
 */
Validator.prototype.createChrome = function(headless) {
  let builder = new SeleniumWebDriver.Builder().forBrowser('chrome');
  const options = new Chrome.Options();
  if (headless) {
    if (CHROME_BINARY && CHROME_BINARY !== undefined) {
      options.setChromeBinaryPath(CHROME_BINARY);
      log('Chrome running with binary: ' + CHROME_BINARY);
    }
    options.headless();
  }
  options.addArguments(['no-sandbox', 'allow-running-insecure-content']);
  options.setAcceptInsecureCerts(true);
  builder.withCapabilities(options);
  return builder.build();
};

/**
 * Constructs a new Firefox browser
 *
 * @param headless
 * @returns {!ThenableWebDriver}
 */
Validator.prototype.createFirefox = function(headless) {
  // Need Firefox WebDriver in order to create the browser.
  if (!process.env.geckodriver || !moduleExists('geckodriver')) {
    this.__exit(1, {
      msg:
        'GeckoDriver for Firefox is not installed.' +
        'Install it using the command: npm install --save geckodriver.'
    });
  }

  let builder = new SeleniumWebDriver.Builder().forBrowser('firefox');
  const options = new Firefox.Options();
  if (headless) {
    if (FIREFOX_BINARY && FIREFOX_BINARY !== undefined) {
      options.setBinary(FIREFOX_BINARY);
      log('Firefox running with binary: ' + FIREFOX_BINARY);
    }
    options.headless();
  }
  options.setAcceptInsecureCerts(true);
  builder.setFirefoxOptions(options);
  return builder.build();
};

/**
 * Creates a new browser with the configured defaults.
 *
 * @param headless If true, will create a new headless browser.
 * @returns {SeleniumWebDriver} A default WebDriver-browser configured.
 */
Validator.prototype.createDefaultBrowser = function(headless) {
  if (this.defaultBrowserName === 'chrome')
    this.browser = this.createChrome(!!headless);
  if (this.defaultBrowserName === 'firefox')
    this.browser = this.createFirefox(!!headless);
  return this.browser;
};

Validator.prototype.setTimeout = function(browser, timeout) {
  return browser.manage().setTimeouts({script: timeout});
};

/**
 * Closes all open browser windows.
 *
 * @returns {Promise<any[] | void>} A promise that resolves when all open browsers are closed.
 */
Validator.prototype.closeAllBrowsers = function() {
  const quits = [];

  log('Closing ' + this.browsers.length + ' browsers.');

  this.browsers.forEach(function(cachedBrowser) {
    quits.push(cachedBrowser.binary.quit());
  });

  return Promise.all(quits).catch(err =>
    this.__exit(1, {msg: 'Error occurred while trying to close browsers.', err})
  );
};

/**
 * Returns the number of violations found.
 * @returns {number} Number of issues found.
 */
Validator.prototype.getValidationErrors = function() {
  return this.__countAllViolationOccurrences(this.results);
};

/**
 * Return the number of issues that were marked as warnings.
 * @returns {number} Number of warnings found.
 */
Validator.prototype.getWarnings = function() {
  return this.__countAllInCompleteOccurrences(this.results);
};

/**
 * Count the number of violations on a given page.
 * @param page A link that were tested by the validator.
 * @returns {number} Number of issues found.
 */
Validator.prototype.getViolationsOnPage = function(page) {
  let numViolationFailes = 0;

  if (page.result.violations.length > 0) {
    numViolationFailes = this.__countViolationOccurrences(
      page.result.violations
    );
  }

  return numViolationFailes;
};

/**
 * Count the number of warnings on a given page.
 * @param page A link that were tested by the validator.
 * @returns {number} Number of warnings found.
 */
Validator.prototype.getWarningsOnPage = function(page) {
  let numIncompleteFailes = 0;

  if (page.result.incomplete.length > 0) {
    numIncompleteFailes = this.__countViolationOccurrences(
      page.result.incomplete
    );
  }

  return numIncompleteFailes;
};

/**
 * Will print out a report about the last executed validation.
 *
 * @param detailedReport Set to true to print out a detailed report about the errors.
 */
Validator.prototype.printReportToConsole = function(detailedReport) {
  this.results.forEach(function(page) {
    log('\n\n');
    log('Page: ' + (page.desc || page.link));
    if (
      page.result.violations.length > 0 ||
      page.result.incomplete.length > 0
    ) {
      log('\n');
      log('Report: ');
      Report.printReport(page.result, page.desc, detailedReport);
      log('\n\n');
    } else {
      log('No errors.');
      log('\n\n');
    }
  }, this);
};

/**
 * A reducer for counting the number of violations in the axe result object.
 * @param violations Axe node tree
 * @returns {number} Number of issues found.
 */
Validator.prototype.__countViolationOccurrences = function(violations) {
  return violations.reduce(
    (count, violation) => count + violation.nodes.length,
    0
  );
};

/**
 * Count the total number of issues found on all pages.
 * @param results Axe result object
 * @returns {number} Number of issues found.
 */
Validator.prototype.__countAllViolationOccurrences = function(results) {
  let violationsFailes = 0;
  results.forEach(function(page) {
    if (page.result.violations.length > 0)
      violationsFailes += this.__countViolationOccurrences(
        page.result.violations
      );
  }, this);
  return violationsFailes;
};

/**
 * Count the total number of warnings found on all pages.
 * @param results Axe node tree
 * @returns {number}
 */
Validator.prototype.__countAllInCompleteOccurrences = function(results) {
  let incompleteFailes = 0;
  results.forEach(function(page) {
    if (page.result.incomplete.length > 0)
      incompleteFailes += this.__countViolationOccurrences(
        page.result.incomplete
      );
  }, this);
  return incompleteFailes;
};

/**
 * Creates a chain of promises that resolves only when all
 * have completed in a sequential order.
 *
 * @param browser The SeleniumWebDriver browser to run the command in.
 * @param promises An object with one or more properties describing a command.
 * @returns {Promise}
 */
Validator.prototype.__commands = function(browser, promises) {
  const self = this;
  return new Promise(function(resolve) {
    self.__commandSelector(browser, promises[0]).then(function() {
      self.__commandChaining(browser, promises, 1, resolve);
    });
  });
};

/**
 * Recursively executes a chain of Promises
 * @param browser The SeleniumWebDriver browser to run the command in.
 * @param promises An object with one or more properties describing a command.
 * @param index The current command to execute.
 * @param resolve Signals the resolver that the command chain is done.
 */
Validator.prototype.__commandChaining = function(
  browser,
  promises,
  index,
  resolve
) {
  const self = this;

  if (index >= promises.length) {
    resolve();
    return;
  }
  this.__commandSelector(browser, promises[index]).then(function() {
    self.__commandChaining(browser, promises, index + 1, resolve);
  });
};

/**
 * Command dispatcher that maps a command to a handler.
 *
 * @param browser The SeleniumWebDriver browser to run the command in.
 * @param chainElement A command to map to a Promise.
 * @returns {Promise}
 */
Validator.prototype.__commandSelector = function(browser, chainElement) {
  if (chainElement.hasOwnProperty('waitFor')) {
    if (typeof chainElement['waitFor'] === 'object') {
      return this.__waitFor(
        browser,
        chainElement['waitFor'].element,
        chainElement['waitFor'].timeout || this.waitTimeout
      );
    } else {
      return this.__waitFor(browser, chainElement['waitFor'], this.waitTimeout);
    }
  }
  if (chainElement.hasOwnProperty('clickOn')) {
    return this.__clickOn(browser, chainElement['clickOn']);
  }
  if (chainElement.hasOwnProperty('pause')) {
    return this.__pause(browser, chainElement['pause']);
  }
  if (chainElement.hasOwnProperty('sleep')) {
    return this.__sleep(browser, chainElement['sleep']);
  }
  if (chainElement.hasOwnProperty('find')) {
    if (typeof chainElement['find'] === 'object') {
      return this.__find(
        browser,
        chainElement['find'].type,
        chainElement['find'].element
      );
    } else {
      return this.__find(browser, 'css', chainElement['find']);
    }
  }
  if (chainElement.hasOwnProperty('selectOption')) {
    return this.__selectOption(
      browser,
      chainElement['selectOption'].from,
      chainElement['selectOption'].option
    );
  }
  if (chainElement.hasOwnProperty('type')) {
    if (chainElement['type'].key) {
      return this.__typeAndPress(
        browser,
        chainElement['type'].into,
        chainElement['type'].text,
        chainElement['type'].key
      );
    } else {
      return this.__type(
        browser,
        chainElement['type'].into,
        chainElement['type'].text
      );
    }
  }
  if (chainElement.hasOwnProperty('keyboard')) {
    return this.__keyboard(
      browser,
      chainElement['keyboard'].keyType,
      chainElement['keyboard'].keyCombo,
      chainElement['keyboard'].element
    );
  }
  if (chainElement.hasOwnProperty('switchFrame')) {
    return this.__switchFrame(browser, chainElement['switchFrame']);
  }
};

/**
 * Use this function to load your own authentication handler.
 * In your definition file, add the "auth" option. See the example.
 *
 * @example <caption>my-definition.js</caption>
 * links:
     - link: 'https://www.nav.no'
       options:
         auth:
           type: 'isso'
           env: 'test'
           handler: './my-auth-handler'
         commands:
         - waitFor: 'body'
 * @example <caption>my-auth-handler.js</caption>
 * exports.handleAuthentication = function(browser, options) {
 *     // implement your own handler here
 * }
 *
 * @param browser A SeleniumWebDriver browser
 * @param authOptions The 'auth' field from the input definition file.
 * @param pageLink The link to the page that should be authenticated.
 * @returns {Promise<*>}
 */
Validator.prototype.__authenticate = async function(
  browser,
  authOptions,
  pageLink
) {
  if (authOptions.handler) {
    const handlerPath = path.resolve(authOptions.handler);

    log('Resolved authentication handler path: ' + handlerPath);

    const handler = require(handlerPath);

    if (DEBUG) {
      log('Authentication handler loaded:', handler);
    }

    if (handler) {
      this.setAuthenticationHandler(handler.handleAuthentication);
    } else {
      this.__exit(1, {
        msg: 'Cannot find authentication handler ' + authOptions.handler
      });
    }
  } else {
    this.__exit(1, {msg: 'No authentication handler is set.'});
  }

  await browser.get(pageLink);

  return this.authenticationHandler(browser, authOptions);
};

Validator.prototype.setAuthenticationHandler = function(authenticationHandler) {
  this.authenticationHandler = authenticationHandler;
};

/**
 * Dropdown-selection (using the option text, not value).
 */
Validator.prototype.__selectOption = function(
  browser,
  cssDropDown,
  cssOptionText
) {
  const self = this;
  return browser
    .findElement(By.css(cssDropDown))
    .then(function(element) {
      return element.sendKeys(cssOptionText);
    })
    .catch(function(err) {
      self.__exit(1, {
        msg:
          'An error occurred while selecting option [' +
          cssOptionText +
          '] from element [' +
          cssDropDown +
          ']. Make sure the element exist.',
        err
      });
    });
};

Validator.prototype.__type = function(browser, cssTypeInto, textToType) {
  const self = this;
  return browser
    .findElement(By.css(cssTypeInto))
    .then(function(element) {
      return element.sendKeys(textToType);
    })
    .catch(function(err) {
      self.__exit(1, {
        msg:
          'An error occurred while sending text into element [' +
          cssTypeInto +
          ']. Make sure the element exist.',
        err
      });
    });
};

Validator.prototype.__typeAndPress = function(
  browser,
  cssTypeInto,
  textToType,
  key
) {
  const self = this;
  return this.__type(browser, cssTypeInto, textToType)
    .then(function() {
      return self.__keyboard(browser, key, [], cssTypeInto);
    })
    .catch(function(err) {
      self.__exit(1, {
        msg:
          'An error occurred while sending text into element [' +
          cssTypeInto +
          '] and pressing key [' +
          key +
          ']. Make sure the element exist.',
        err
      });
    });
};

/**
 * Find the first visible element using a given selector.
 *
 * @param browser A SeleniumWebDriver browser
 * @param type Type of selector. One of css, xpath, name, classname, id or linktext.
 * @param selector The selector to use, depending on the given type.
 * @returns {*|Promise<T | never>} Returns a promise that resolves either true or false.
 * @private
 */
Validator.prototype.__find = function(browser, type, selector) {
  const self = this;
  let locator = {};

  if (type.toLowerCase() === 'xpath') locator = By.xpath(selector);
  else if (type.toLowerCase() === 'linktext') locator = By.linkText(selector);
  else if (type.toLowerCase() === 'name') locator = By.name(selector);
  else if (type.toLowerCase() === 'classname') locator = By.className(selector);
  else if (type.toLowerCase() === 'id') locator = By.id(selector);
  else locator = By.css(selector);

  return browser
    .findElement(locator)
    .then(element => {
      return element.isDisplayed();
    })
    .catch(function(err) {
      self.__exit(1, {
        msg:
          'An error occurred when trying to find element [' + selector + '].',
        err
      });
    });
};

Validator.prototype.__waitFor = function(browser, cssString, timeout) {
  const self = this;
  return browser
    .wait(Until.elementsLocated(By.css(cssString)), timeout)
    .catch(function(err) {
      self.__exit(1, {
        msg:
          'An error occurred while waiting for css element [' +
          cssString +
          ']. Make sure the element exist.',
        err
      });
    });
};

Validator.prototype.__clickOn = function(browser, cssString) {
  const self = this;
  return browser
    .findElement(By.css(cssString))
    .then(function(element) {
      return element.click();
    })
    .catch(function(err) {
      self.__exit(1, {
        msg: 'An error occurred when trying to click on [' + cssString + '].',
        err
      });
    });
};

Validator.prototype.__switchFrame = function(browser, frame) {
  const self = this;
  if (frame === 'default') return browser.switchTo().defaultContent();
  return browser
    .switchTo()
    .frame(frame)
    .catch(function(err) {
      self.__exit(1, {
        msg:
          "An error occurred when trying to switch to frame '" + frame + "'.",
        err
      });
    });
};

Validator.prototype.__pause = function(browser, time) {
  const stop = new Date().getTime() + time;
  while (new Date().getTime() < stop) {}
  return Promise.resolve(true);
};

Validator.prototype.__sleep = function(browser, time) {
  return browser.sleep(time);
};

Validator.prototype.__keyboard = function(
  browser,
  keyType,
  keyCombo = [],
  elementCss = 'body'
) {
  const self = this;
  return browser
    .findElement(By.css(elementCss))
    .then(function(element) {
      const keyTypeId = self.__keytype(keyType, keyCombo);
      return element.sendKeys(keyTypeId);
    })
    .catch(function(err) {
      this.__exit(1, {
        msg:
          'An error occurred. Could not press key [' +
          keyType +
          '] Should be one of tab/enter/esc/backspace/delete/alt/shift/ctrl|command.',
        err
      });
    });
};

Validator.prototype.__keytype = function(key, keyCombo) {
  // key combination with stateful and stateless keys
  if (key.toLowerCase() === 'combo' && keyCombo && keyCombo.length > 0)
    return this.__keyCombo(keyCombo);
  // stateless keys
  else if (key.toLowerCase() === 'tab') return SeleniumWebDriver.Key.TAB;
  else if (key.toLowerCase() === 'enter') return SeleniumWebDriver.Key.ENTER;
  else if (key.toLowerCase() === 'esc') return SeleniumWebDriver.Key.ESCAPE;
  else if (key.toLowerCase() === 'delete') return SeleniumWebDriver.Key.DELETE;
  else if (key.toLowerCase() === 'backspace')
    return SeleniumWebDriver.Key.BACK_SPACE;
  // stateful keys that require Key.NULL at the end
  else if (key.toLowerCase() === 'ctrl') return SeleniumWebDriver.Key.COMMAND;
  else if (key.toLowerCase() === 'alt') return SeleniumWebDriver.Key.ALT;
  else if (key.toLowerCase() === 'shift') return SeleniumWebDriver.Key.SHIFT;
  else if (key.toLowerCase() === 'command')
    return SeleniumWebDriver.Key.COMMAND;
  else if (key.toLowerCase() === 'null') return SeleniumWebDriver.Key.NULL;
  // other keys on the keyboard are just returned as is (letters/numbers)
  else return key;
};

Validator.prototype.__keyCombo = function(keyCombo) {
  const self = this;
  let chord = [];
  const keyArr = keyCombo.split(',');
  keyArr.forEach(key => chord.push(self.__keytype(key, undefined)));
  return SeleniumWebDriver.Key.chord(keyCombo);
};

Validator.prototype.__browserLogs = async function(browser) {
  const logs = await browser
    .manage()
    .logs()
    .get(SeleniumWebDriver.logging.Type.BROWSER);
  log('#####');
  log('BROWSER LOGS: ');
  log(logs);
  log('#####');
};

Validator.prototype.__exit = function(code, {msg, err}) {
  if (code > 0) {
    if (msg) error(msg);
    if (err) error(err);
  } else log(msg);

  log('Exiting. Closing ' + this.browsers.length + ' browsers');

  this.closeAllBrowsers().then(() => {
    process.exit(1);
  });
};

function printDebugInfo() {
  log('\nValidator configuration set:\n');
  log('DEFINITION_FILE = ' + DEFINITION_FILE);
  log('BROWSER = ' + BROWSER);
  log('HEADLESS = ' + HEADLESS);
  log('TIMEOUT = ' + TIMEOUT);
  log('WAIT_TIMEOUT = ' + WAIT_TIMEOUT);
  log('DETAILED_REPORT = ' + DETAILED_REPORT);
  log('ASSERT_WARNINGS = ' + ASSERT_WARNINGS);
  log('TAGS = ' + TAGS);
  log('\n');
}

function moduleExists(name) {
  try {
    return require.resolve(name);
  } catch (e) {
    return false;
  }
}

process.on('unhandledRejection', err => {
  error('UnhandledRejection has occurred.');
  error(err);
});

module.exports = Validator;
