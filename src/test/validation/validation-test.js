const yaml = require('js-yaml');
const fs = require('fs');

const MochaRunner = require('../../main/runners/mocha/MochaRunner');
const runner = new MochaRunner();
const ProcessHandler = require('../../main/processes/ProcessHandler');
const htmlReport = require('../../main/reports/html-report');

// set options
let name = "UU Tests";
const headless = true;
const warnings = true;
const detailedReport = false;

let okTestSuite = [
  'ok-tests/select-option-test',
  'ok-tests/heading-order-test',
  'ok-tests/skip-link-test'
];

let failingTestSuite = [
  'fail-tests/select-option-test',
  'fail-tests/heading-order-test',
  'fail-tests/skip-link-test'
];

/**
 * This test runner loads multiple test cases into one Yaml document
 * that the validator will run.
 * @param testSites A list of test sites that will be validated.
 */
function runTestSuite(testSites) {
  // prepare a single config object with links to test
  let yamls = {links: []};

  testSites.forEach(testSite => {
    console.log('Loading test ' + testSite);

    // safely read in the test case yaml config
    const yamlObj = yaml.safeLoad(
      fs.readFileSync(`./src/test/validation/${testSite}/definition.yml`)
    );
    console.log('YAML object loaded:', yamlObj.links);

    // finally add the links and their options to the main config file
    yamls.links.push(...yamlObj.links);
  });

  name += name.includes("fail") ? "that must fail." : "that must pass.";

  return runner.run(yamls, {name, headless, warnings, detailedReport});
}

async function runTests() {
    const fails = await runTestSuite(failingTestSuite);
    const oks = await runTestSuite(okTestSuite);

    htmlReport.printReport(fails.results, "fails");

    new ProcessHandler().assert(fails.fails + oks.fails, fails.passes + oks.passes);
}

runTests();