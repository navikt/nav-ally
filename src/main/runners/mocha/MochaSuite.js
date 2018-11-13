const assert = require('assert');
const Validator = require('../../validator');
const fileInput = require('../../inputs/InputLoader');
const {describe, it} = require('mocha');

/**
 * Configuration from environment variables or defaults.
 */
const {NAME, TIMEOUT, ASSERT_WARNINGS} = require('../../globals');

/**
 * Mocha runner for the validator.
 */
describe(NAME, function() {
  this.timeout(TIMEOUT);

  const validator = new Validator();

  it('Test Suite', function(done) {
    const assertWarnings = fileInput.getBooleanValue(
      ASSERT_WARNINGS,
      'ASSERT_WARNINGS'
    );

    validator
      .run()
      .then(function(results) {
        // dynamically create tests for each page
        results.forEach(page => {
          describe(page.desc || page.link, function() {
            it('should have no accessibility violations', function(partDone) {
              assert.strictEqual(
                validator.getViolationsOnPage(page),
                0,
                'Accessibility violations found.'
              );
              partDone();
            });
            if (assertWarnings) {
              it('should have no accessibility warnings', function(partDone) {
                assert.strictEqual(
                  validator.getWarningsOnPage(page),
                  0,
                  'Accessibility warnings found.'
                );
                partDone();
              });
            }
          });
        });

        // mark the test suite as success or fail
        assert.strictEqual(
          validator.getValidationErrors(),
          0,
          'Test suite contains accessibility violations.'
        );
        if (assertWarnings)
          assert.strictEqual(
            validator.getWarnings(),
            0,
            'Test suite contains accessibility warnings.'
          );
      })
      .then(done, done);
  });
});
