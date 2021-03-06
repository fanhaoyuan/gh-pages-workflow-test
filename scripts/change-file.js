'use stirct';

const fs = require('fs');
const execSync = require('child_process').execSync;

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

const upToDateCommitHash = execSync(`git log --format=%H -1`)
  .toString()
  .trim();

if (upToDateCommitHash === lastCommitHash) {
  console.log('everything is up to date.');
  process.exit(0);
}

fs.writeFileSync('last-commit-hash', upToDateCommitHash, 'utf-8');
