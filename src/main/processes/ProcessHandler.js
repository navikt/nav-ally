const {log, error} = require('../log/log');

/**
 * A process handler that can assert and set exit status code
 * depending on test method assertation used.
 *
 * Test method used can be =0 or <x where x is a number. =0 is
 * absolute no errors, <x is 'less than x errors'.
 *
 * @class ProcessHandler
 */
class ProcessHandler {
  /**
   * Initialises a new process handler with default test method (expect no errors).
   *
   * @constructor
   */
  constructor() {
    this.testMethod = '=0';
  }

  /**
   * Expect maximum 'mx' errors.
   *
   * @param mx A number indicating the max number of errors allowed.
   * @returns {ProcessHandler} This handler.
   */
  mxFails(mx) {
    this.testMethod = `<${mx}`;
    return this;
  }

  /**
   * Expect no errors. This is the default test method.
   * @returns {ProcessHandler}
   */
  noFails() {
    this.testMethod = '=0';
    return this;
  }

  /**
   * Run assertion based on the selected test method.
   * @param fails The total number of fails
   * @param passes The total number of passes
   */
  assert(fails, passes) {
    if (this.testMethod === '=0') {
      if (fails && fails > 0) {
        error(`Failed tests: ${fails}`);
        log(`Passed tests: ${passes}`);
        log('\n');
        process.exit(1);
      }
    }
    // max x fails
    else if (this.testMethod.match(/<\d+/gi)) {
      const maxNumberOfErrors = this.testMethod.split('<')[1];
      if (fails && fails > maxNumberOfErrors) {
        error(
          `Expected maximum ${maxNumberOfErrors} errors. Actual: ${fails} > ${maxNumberOfErrors}`
        );
        log('\n');
        process.exit(1);
      }
    } else {
      error('Unknown assertation method specified.');
      process.exit(1);
    }
  }
}

module.exports = ProcessHandler;
