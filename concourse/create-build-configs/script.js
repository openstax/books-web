#!/usr/bin/env node

const fs = require('fs');
const versionFile = 'rex-web/.git/short_ref';
const envFile = 'build-configs/config.env';
const argFile = 'build-configs/config.json';
const commitFile = 'build-configs/commit.txt';
const releaseFile = 'build-configs/release-id.txt';

const handleErr = err => {
  if (!err) return;
  console.error(`Error: ${err}`);
  process.exit(1);
};

fs.readFile(versionFile, 'utf8', function(err, commit) {
  const date = new Date().toISOString().split('T')[0];
  const releaseId = `${date}/${commit}`;
  const args = {
    PUBLIC_URL: `/rex/releases/${releaseId}`,
    REACT_APP_CODE_VERSION: commit,
    REACT_APP_RELEASE_ID: releaseId,
    REACT_APP_ENV: 'production'
  };

  console.log(JSON.stringify(args, null, 2));
  console.log('Generating env file...');
  fs.writeFile(
    envFile,
    Object.entries(args).reduce((result, [key, value]) => [...result, `${key}=${value}`], []).join("\n"),
    handleErr
  );

  console.log('Generating build arg file...');
  fs.writeFile(argFile, JSON.stringify(args), handleErr);

  console.log(`Generating commit file with: ${commit}`);
  fs.writeFile(commitFile, commit, handleErr);

  console.log(`Generating release id file with: ${releaseId}`);
  fs.writeFile(releaseFile, releaseId, handleErr);
});
