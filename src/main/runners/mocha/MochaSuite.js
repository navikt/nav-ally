const assert = require('assert');
const Validator = require('../../validator');
const fileInput = require('../../inputs/InputLoader');

/**
 * Configuration from environment variables or defaults.
 */
const {NAME, TIMEOUT, ASSERT_WARNINGS} = require('../../globals');

/**
 * Mocha runner for the validator.
 */
describe(NAME, function() {
  this.timeout(TIMEOUT);

  it('Test Suite', function(done) {
    const assertWarnings = fileInput.getBooleanValue(
      ASSERT_WARNINGS,
      'ASSERT_WARNINGS'
    );

    let validator = new Validator();

    validator
      .run()
      .then(function() {
        validator.printReportToConsole();

        // dynamically create tests for each page
        validator.results.forEach(page => {
          describe(page.desc || page.link, function() {
            it('should have no accessibility violations', function(partDone) {
              assert.equal(validator.getViolationsOnPage(page), 0);
              partDone();
            });
            if (assertWarnings) {
              it('should have no accessibility warnings', function(partDone) {
                assert.equal(validator.getWarningsOnPage(page), 0);
                partDone();
              });
            }
          });
        });

        // mark the test suite as success or fail
        assert.equal(validator.getValidationErrors(), 0);
        if (assertWarnings) assert.equal(validator.getWarnings(), 0);
      })
      .then(done, done);
  });
});
