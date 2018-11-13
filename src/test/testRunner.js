const runner = require('../runner/runners/mocha/MochaRunner');

/**
 * An example of to use the MochaRunner that is included in the validator.
 */
function testRun() {
    process.env.DEFINITION_FILE = "./src/test/definitions/nav.yml";
    process.env.HEADLESS = false;
    process.env.DETAILED_REPORT = false;
    runner.runValidator();
}

testRun();