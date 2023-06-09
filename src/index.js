// noinspection ExceptionCaughtLocallyJS

const {existsSync, readFileSync, writeFileSync} = require('fs');
const {diffTrimmedLines, createTwoFilesPatch} = require('diff');
const {exec} = require('child_process');
const {getInput, setFailed, setOutput} = require('@actions/core');

try {
  let packagePath = getInput('package-json-path');
  let licensesPath = getInput('license-report-path');
  let outputFormat = getInput('output-format');

  if (packagePath === '') {
    packagePath = 'package.json';
  }

  if (licensesPath === '') {
    licensesPath = 'licenses.json';
  }

  if (outputFormat === '') {
    outputFormat = 'json';
  }

  switch (outputFormat) {
    case 'table':
    case 'json':
    case 'csv':
    case 'markdown':
      break;
    default:
      throw new Error('Unknown output format');
  }

  exec(
    `node ./dist-license-report/index.js --output=${outputFormat} --package=${packagePath}${outputFormat === 'json' ? '| jq' : ''}`,
    (err, stdout) => {
      if (err) {
        throw new Error(err.message);
      }

      const newLicenses = stdout.toString();

      let oldLicenses;
      if (existsSync(licensesPath)) {
        oldLicenses = readFileSync(licensesPath, {encoding: 'utf8'});
      } else {
        oldLicenses = '';
      }

      const diffs = diffTrimmedLines(oldLicenses, newLicenses);

      if (diffs.length > 1 || oldLicenses === '') {
        console.log('New licenses detected, updating them...');

        writeFileSync(licensesPath, newLicenses, {encoding: 'utf8'});
        setOutput('diff', '```\n' + createTwoFilesPatch(licensesPath, licensesPath, oldLicenses, newLicenses) + '```');
        setOutput('licenses', newLicenses);
      } else {
        console.log('Licenses match, nothing to do.');

        setOutput('diff', '');
        setOutput('licenses', newLicenses);
      }
    }
  );
} catch (error) {
  console.error(error.message);
  setFailed(error.message);
}
