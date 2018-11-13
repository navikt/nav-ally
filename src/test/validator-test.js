const yaml = require('js-yaml');
const fs = require('fs');

let runner = require('../main/runners/mocha/MochaRunner');

// set options
process.env.HEADLESS = true;
process.env.ASSERT_WARNINGS = true;
process.env.DETAILED_REPORT = false;

let testSuite = [
  'ok-tests/select-option-test',
  'ok-tests/heading-order-test',
  'ok-tests/skip-link-test'
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
      fs.readFileSync(`./src/test/testweb/${testSite}/definition.yml`)
    );
    console.log('YAML object loaded:', yamlObj.links);

    // finally add the links and their options to the main config file
    yamls.links.push(...yamlObj.links);
  });

  // set the correct env file to load it with the validator
  process.env.YAML_DEFINITION = yaml.safeDump(yamls);
  runner.runValidator();
}

runTestSuite(testSuite);
