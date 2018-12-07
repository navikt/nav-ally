const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const {log, error, trace} = require('../log/log');

/**
 * @class InputLoader
 */
function InputLoader() {} /* eslint-disable-line no-unused-vars */

/**
 * Loads files from one of two possible environment variables.
 *
 * @memberOf InputLoader
 * @param definitionFile Loads config from an external definition file.
 * @returns {*}
 */
function loadInputFromEnvironment(definitionFile) {
  if (definitionFile) {
    return handleInputFromDefinitionFile(definitionFile);
  }

  error('\nNo input has been configured.');
  error(
    'Use the environment variable DEFINITION_FILE to load input from file.'
  );
  process.exit(1);
}

function handleInputFromYaml(yamlFile) {
  log('Loading yaml definition:');
  const yamlObj = preProcessYaml(yaml.safeLoad(yamlFile));
  log('YAML object loaded:', yamlObj);
  return yamlObj;
}

function handleInputFromDefinitionFile(definitionFile) {
  const realPath = path.resolve(definitionFile);

  if (!definitionFile) {
    trace(
      'Invalid input. Did you forget to set the DEFINITION_FILE environment variable?'
    );
    process.exit(1);
  }

  let validationFileExists = fs.existsSync(realPath);

  if (validationFileExists) {
    return loadDefinitionFile(definitionFile, realPath);
  } else {
    trace('The specified file was not found: ' + realPath);
    process.exit(1);
  }
}

function loadDefinitionFile(name, file) {
  if (file.endsWith('.js')) {
    console.log('Loading Javascript definition file: ' + name);
    let jsObj = require(file);
    validateInputObject(jsObj);
    return jsObj;
  } else if (file.endsWith('.yml') || file.endsWith('.yaml')) {
    try {
      log('Loading Yaml definition file: ' + name);
      const yamlObj = preProcessYaml(yaml.safeLoad(fs.readFileSync(file)));
      log('YAML object loaded:', yamlObj);
      return yamlObj;
    } catch (err) {
      error('An error occurred while loading YAML definition file.');
      trace(err);
      process.exit(1);
    }
  } else {
    trace('Unsupported definition file.');
    process.exit(1);
  }
}

function preProcessYaml(yamlObj) {
  console.log('Preprocessing YAML object read:', yamlObj);
  if (yamlObj.links) {
    yamlObj.links = yamlObj.links.map(link => {
      if (typeof link === 'string') {
        return {link: link};
      } else if (typeof link === 'object') {
        return link;
      }
    });
    return yamlObj;
  } else {
    return {links: []};
  }
}

function validateInputObject(jsObj) {
  if (jsObj.links) {
    if (Array.isArray(jsObj.links)) {
      validateJavaScriptInputLinks(jsObj.links);
      console.log('JavaScript input is validated OK.');
    } else {
      console.error('Javascript input definition is not an array.');
      console.error(
        "Expected format: [ {link: 'http://abc.com'}, {link: 'http://def.com'}, etc... ]"
      );
      process.exit(1);
    }
  } else {
    console.error(
      "Javascript input definition is not valid. Must be an object and have a field named 'links'."
    );
    console.error(
      "Expected format: { links = [ {link: 'http://abc.com'}, {link: 'http://def.com'}, etc... ] }"
    );
    console.error(
      'See https://github.com/navikt/pus-uu-validator/blob/master/README.md for more information.'
    );
    process.exit(1);
  }
}

function validateJavaScriptInputLinks(links) {
  const isString = input => typeof input === 'string';

  links.forEach(input => {
    if (typeof input === 'object') {
      if (!input.link) {
        handleInvalidInput(
          input,
          "JavaScript input is invalid. Field 'link' is missing."
        );
      }
      if (!isString(input.link)) {
        handleInvalidInput(input, "Value of field 'link' is not a string.");
      }
    } else {
      handleInvalidInputType();
    }
  });
}

function getBooleanValue(property, propertyName) {
  if (property === 'true' || property === true) return true;
  if (property === 'false' || property === false) return false;

  console.error(propertyName + ' property should be either true or false.');
  process.exit(1);
}

function handleInvalidInputType() {
  console.error('Invalid input type. Must be a string or an object.');
  console.error(
    'See https://github.com/navikt/pus-uu-validator/blob/master/README.md for more information.'
  );
  process.exit(1);
}

function handleInvalidInput(input, msg) {
  console.error(msg);
  console.error('Check the following input:');
  console.error(input);
  process.exit(1);
}

exports.loadInputFromEnvironment = loadInputFromEnvironment;
exports.handleInputFromYaml = handleInputFromYaml;
exports.handleInputFromDefinitionFile = handleInputFromDefinitionFile;
exports.loadDefinitionFile = loadDefinitionFile;
exports.preProcessYaml = preProcessYaml;
exports.validateInputObject = validateInputObject;
exports.validateJavaScriptInputLinks = validateJavaScriptInputLinks;
exports.getBooleanValue = getBooleanValue;
exports.handleInvalidInputType = handleInvalidInputType;
exports.handleInvalidInput = handleInvalidInput;
