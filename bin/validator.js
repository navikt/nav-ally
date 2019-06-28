#!/usr/bin/env node

const program = require('commander');
const path = require('path');
const fs = require('fs');
const exists = fs.existsSync || path.existsSync;
const cwd = process.cwd();
const ProcessHandler = require('../src/main/processes/ProcessHandler');

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
    '-h, --headless',
    'run in headless mode'
  )
  .option(
    '-r, --detailed-report',
    'print a detailed report'
  )
  .option(
    '-d, --debug-info',
    'prints out debug info to console if set'
  )
  .option(
    '-w, --warnings',
    'validation fails on warnings too if set'
  )
  .option('-M, --max-errors <value>', 'accept up "M" number of errors')
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

flagExists(
  program.headless,
  '> Running headless',
  '> Running browser.',
  'HEADLESS'
);
flagExists(
  program.detailedReport,
  '> Running with detailed report turned on.',
  '> Running with detailed report turned off.',
  'DETAILED_REPORT'
);
flagExists(
  program.debugInfo,
  '> Running with debug info turned on.',
  '> Running with debug info turned off.',
  'DEBUG'
);
flagExists(
  program.warnings,
  '> Running with warnings turned on.',
  '> Running with warnings turned off.',
  'ASSERT_WARNINGS'
);

function flagExists(flag, msg, altMsg, envParam) {
  if (!flag) {
    console.log(altMsg);
    process.env[envParam] = false;
  } else {
    console.log(msg);
    process.env[envParam] = true;
  }
}

async function run() {
  const MochaRunner = require('../src/main/runners/mocha/MochaRunner');
  const runner = new MochaRunner();
  const results = await runner.run();

  if (program.maxErrors) {
    new ProcessHandler().mxFails(program.maxErrors).assert(results.fails, results.passes);
  } else {
    new ProcessHandler().assert(results.fails, results.passes);
  }
}

run();
