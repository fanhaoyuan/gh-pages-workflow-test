'use stirct';

const fs = require('fs');
const execSync = require('child_process').execSync;

const bufferToString = buffer => buffer.toString().trim();

let lastCommitHash;

try {
  const hash = fs.readFileSync('last-commit-hash', 'utf-8');

  if (!hash) {
    throw new Error();
  }

  lastCommitHash = hash;
} catch (error) {
  lastCommitHash = '';
}

const gitLog = bufferToString(execSync(`git log --format=%H -1`)).split('\n');

const upToDateCommitHash = gitLog[0].split(' ')[0];

if (upToDateCommitHash === lastCommitHash) {
  console.log('everything is up to date.');
  process.exit(0);
}

fs.writeFileSync('last-commit-hash', upToDateCommitHash, 'utf-8');
