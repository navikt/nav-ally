#!/usr/bin/env node

var program = require('commander');
var path = require('path');
var fs = require('fs');
var exists = fs.existsSync || path.existsSync;
let Validator = require('../src/main/runners/mocha/MochaRunner');

program._name = 'nav-ally';

program
  .version(
    JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
    ).version
  )
  .usage('[options]')
  .option('-f, --definition-file <path>', 'set definition file')
  .option(
    '-h, --headless <value>',
    'run in headless mode',
    /^(yes|no|true|false)$/i,
    'yes'
  )
  .option(
    '-r, --detailed-report <value>',
    'print a detailed report',
    /^(yes|no|true|false)$/i,
    'no'
  )
  .option(
    '-d, --debug-info <value>',
    'print out debug info to console',
    /^(yes|no|true|false)$/i,
    'no'
  )
  .parse(process.argv);

if (program.definitionFile) {
  let definitionFilePath = program.definitionFile;
  let folder = '';

  // absolute or relative path
  if (definitionFilePath.includes('/') || definitionFilePath.includes('\\')) {
    folder = path.resolve(definitionFilePath);
  } else {
    // or a file within the current working directory
    folder = path.join(cwd, definitionFilePath);
  }

  if (exists(folder)) {
    console.error("> Setting path '%s' as definition file.", folder);
    process.env.DEFINITION_FILE = definitionFilePath;
  } else {
    console.error("> Path '%s' does not exist", folder);
    process.exit(1);
  }
} else {
  console.error('Required flag -f / --definition-file <path> is not set.');
  process.exit(1);
}

yesOrNo(
  program.headless,
  '> Running headless',
  '> Running browser.',
  '> Invalid value given to flag -h / --headless.',
  'HEADLESS'
);
yesOrNo(
  program.detailedReport,
  '> Running with detailed report turned on.',
  '> Running with detailed report turned off.',
  '> Invalid value given to flag -r / --detailed-report.',
  'DETAILED_REPORT'
);
yesOrNo(
  program.debugInfo,
  '> Running with debug info turned on.',
  '> Running with debug info turned off.',
  '> Invalid value given to flag -d / --debug-info.',
  'DEBUG'
);

Validator.runValidator();

function yesOrNo(flag, msg, altMsg, errorMsg, envParam) {
  if (!flag) {
    console.log(altMsg);
    process.env[envParam] = false;
  } else {
    if (flag === 'yes' || flag === 'true' || flag === true) {
      console.log(msg);
      process.env[envParam] = true;
    } else if (flag === 'no' || flag === 'false' || flag === false) {
      console.log(altMsg);
      process.env[envParam] = false;
    } else {
      console.error(errorMsg + ' - Must be one of yes/no/true/false');
      process.exit(1);
    }
  }
}
