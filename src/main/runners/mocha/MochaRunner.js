const Mocha = require('mocha');
const Test = Mocha.Test;
const Suite = Mocha.Suite;

const assert = require('assert');
const Validator = require('../../validator');
const {NAME, TIMEOUT, ASSERT_WARNINGS} = require('../../globals');
const {error} = require('../../log/log');

/**
 * Executes the validator with a custom Mocha-runner
 * that dynamically creates tests for each page.
 *
 * See the {@link run} method for example usage.
 *
 * @class MochaRunner
 * @constructor
 * @public
 */
function MochaRunner() {}

/**
 * Returns a promise that will return validation results once
 * validation is complete.
 *
 * @param input Input definition object. Must be loaded from {@link InputLoader.js}
 * @param config Configuration to use when running the tests. Overrides the default values. See example.
 * @returns {Promise<*>} Returns a resultset when complete.
 *
 * @example <caption>Configuration example with the MochaRunner</caption>

    async function configure() {
        // set options
        const name = "a11y-test";
        const headless = true;
        const warnings = true;
        const detailedReport = false;

        const MochaRunner = require('nav-ally/MochaRunner');
        const runner = new MochaRunner();
        const results = await runner.run({links: ['http://some-url.com'] }, {name, headless, warnings, detailedReport});
        return results;
    }

    @example <caption>Without configuration</caption>

     async function run() {
        const MochaRunner = require('nav-ally/MochaRunner');
        const runner = new MochaRunner();
        const result = await runner.run();
        assert.ok(result.fails < result.passes);
    }


     @example <caption>With a custom callback function</caption>

     async function run() {
        const warnings = true;
        const detailedReport = false;

        const assert = require('assert');
        const MochaRunner = require('nav-ally/MochaRunner');
        const runner = new MochaRunner();
        await runner.run({links: ['http://some-url.com'] }, {warnings, detailedReport}, result => {
            assert.ok(result.fails < result.passes);
        });
     }

     @example <caption>With promise chaining.</caption>

     function run() {
        const warnings = true;
        const detailedReport = false;

        const assert = require('assert');
        const MochaRunner = require('nav-ally/MochaRunner');
        const runner = new MochaRunner();
        return runner.run(
            {links: ['http://some-url.com'] }, {warnings, detailedReport}
        ).then(result => {
            assert.ok(result.fails < result.passes);
        });
     }
 */
MochaRunner.prototype.run = async function(input, config = {}) {
  const self = this;
  return new Promise((resolve, reject) => {
    return self.__runValidator(
      resolve,
      self.input || input,
      self.config || config
    );
  });
};

MochaRunner.prototype.__runValidator = async function(
  resolve,
  input,
  config = {},
  callback
) {
  const mocha = new Mocha();

  let fails = 0;
  let passes = 0;
  const testFails = [];
  const testPasses = [];

  const name = config.name || NAME;
  const timeout = config.timeout || TIMEOUT;
  const assertWarnings = config.warnings || ASSERT_WARNINGS;

  const validator = new Validator(input, config);
  const results = await validator.run();

  const parentSuite = Suite.create(mocha.suite, name);

  results.forEach(page => {
    const suite = Suite.create(parentSuite, page.desc || page.link);
    suite.timeout(timeout);

    if (!(page.options && page.options.test)) {
      this.__generateTests(suite, validator, page, assertWarnings);
    } else {
      if (!(page.options && page.options.test && page.options.test.expect)) {
        const msg =
          'Test option does not have an expectation for link ' +
          (page.desc || page.link);
        error(msg, page.options.test);
        throw new Error(msg);
      }

      const expect = page.options.test.expect;

      if (expect.startsWith('fail')) {
        this.__generateInvertedTests(suite, validator, page, assertWarnings);
      } else if (expect.startsWith('pass')) {
        this.__generateTests(suite, validator, page, assertWarnings);
      } else {
        const msg = 'Unknown test expectation type: ' + expect;
        error(msg);
        throw new Error(msg);
      }
    }
  });

  mocha
    .run()
    .on('pass', function(test) {
      passes++;
      testPasses.push(test);
    })
    .on('fail', function(test, err) {
      fails++;
      testFails.push({test, err});
    })
    .on('end', function() {
      const resultset = {
        fails,
        passes,
        testFails,
        testPasses
      };
      if (resolve) resolve(resultset);
      if (callback) callback(resultset);

      return resultset;
    });
};

/**
 * Generates tests that is expected to pass without
 * any failures (violations or warnings).
 *
 * @param suite The Mocha test suite to add the test to
 * @param validator The validator class to validate containing the test results
 * @param page The page to generate tests to
 * @param assertWarnings If true, ignores assertion of warnings.
 * @memberOf MochaRunner
 * @private
 */
MochaRunner.prototype.__generateTests = function(
  suite,
  validator,
  page,
  assertWarnings
) {
  suite.addTest(
    new Test('should have no accessibility violations', partDone => {
      assert.strictEqual(
        validator.getViolationsOnPage(page),
        0,
        'Accessibility violations found.'
      );
      partDone();
    })
  );

  if (assertWarnings) {
    suite.addTest(
      new Test('should have no accessibility warnings', partDone => {
        assert.strictEqual(
          validator.getWarningsOnPage(page),
          0,
          'Accessibility warnings found.'
        );
        partDone();
      })
    );
  }
};

/**
 * Generates tests that is expected to fail, either on
 * any failures (violations + warnings), or only violations
 * or warnings. The 'expect' option can have one of three
 * values: fail, fail-warnings, fail-violations. The last two
 * will fail only on violations, or only on warnings.
 * Add the key option.test.expect to your config.
 *
 * @example <caption>Test expectation</caption>
     links:
     - link: "http://www.test.com/"
     options:
     test:
     expect: "to-fail"
 *
 * @param suite The Mocha test suite to add the test to
 * @param validator The validator class to validate containing the test results
 * @param page The page to generate tests to
 * @param assertWarnings If true, ignores assertion of warnings.
 * @memberOf MochaRunner
 * @private
 */
MochaRunner.prototype.__generateInvertedTests = function(
  suite,
  validator,
  page,
  assertWarnings
) {
  const expect = page.options.test.expect;

  if (this.__assertTestOptions(expect, 'fail')) {
    const totalFails =
      validator.getValidationErrors() + validator.getWarnings();
    suite.addTest(
      new Test('should have accessibility issues', partDone => {
        assert.ok(totalFails > 0, 'Accessibility issues expected, none found.');
        partDone();
      })
    );
  } else if (this.__assertTestOptions(expect, 'fail-violations')) {
    suite.addTest(
      new Test('should have accessibility violations', partDone => {
        assert.ok(
          validator.getViolationsOnPage(page) > 0,
          'Accessibility violations expected, none found.'
        );
        partDone();
      })
    );
  } else if (
    assertWarnings &&
    this.__assertTestOptions(expect, 'fail-warnings')
  ) {
    suite.addTest(
      new Test('should have accessibility warnings', partDone => {
        assert.ok(
          validator.getWarningsOnPage(page) > 0,
          'Accessibility warnings expected, none found.'
        );
        partDone();
      })
    );
  } else {
    const msg = 'Unknown test expectation type: ' + expect;
    error(msg);
    throw new Error(msg);
  }
};

MochaRunner.prototype.__assertTestOptions = function(expect, option) {
  const contains = (string, array) =>
    array.map(key => key.toLowerCase()).indexOf(string) > -1;
  return (
    (Array.isArray(expect) && contains(option.toLowerCase())) ||
    expect === option
  );
};

module.exports = MochaRunner;
