// noinspection ExceptionCaughtLocallyJS

const core = require('@actions/core');
const {existsSync, readFileSync, writeFileSync} = require('fs');
const {diffTrimmedLines, createTwoFilesPatch} = require('diff');
const {format} = require('prettier');
const {exec} = require('child_process');

try {
  const packagePath = 'package.json'; //core.getInput('package');
  const licensesPath = 'licenses.json'; //core.getInput('path');
  const outputFormat = 'json'; //core.getInput('output');

  switch (outputFormat) {
    case 'table':
    case 'json':
    case 'csv':
    case 'html':
    case 'markdown':
      break;
    default:
      throw new Error('Unknown output format');
  }

  exec(`node ./dist-license-report/index.js --output=${outputFormat} --package=${packagePath}`, (err, stdout) => {
    if (err) {
      throw new Error(err.message);
    }

    const newLicenses = format(stdout.toString(), {semi: false, parser: 'json'});

    let oldLicenses;
    if (existsSync(licensesPath)) {
      oldLicenses = readFileSync(licensesPath, {encoding: 'utf8'});
    } else {
      oldLicenses = '';
    }

    const diffs = diffTrimmedLines(oldLicenses, newLicenses);

    if (diffs.length > 1) {
      console.log('New licenses detected, updating them...');

      let diffString = '```\n' + createTwoFilesPatch(licensesPath, licensesPath, oldLicenses, newLicenses);
      diffString += '```';
      diffString = format(diffString, {parser: 'markdown'});

      writeFileSync(licensesPath, newLicenses, {encoding: 'utf8'});
      core.setOutput('diff', diffString);
      core.setOutput('licenses', newLicenses);
    } else {
      console.log('Licenses match, nothing to do.');
      core.setOutput('diff', '');
      core.setOutput('licenses', '');
    }
  });
} catch (error) {
  console.error(error.message);
  core.setFailed(error.message);
}
