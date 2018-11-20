let Mocha = require('mocha');

/**
 * Executes the validator with custom Mocha-runner.
 */
exports.runValidator = function() {
  let mocha = new Mocha();

  mocha.addFile(require.resolve('./MochaSuite'));

  mocha.run(function(failures) {
    process.exitCode = failures ? -1 : 0; // exit with non-zero status if there were failures
  });
};
