#!/usr/bin/env node

const fs = require('fs');
const versionFile = 'rex-web/.git/short_ref';
const argFile = 'build-configs/image-args.json';
const commitFile = 'build-configs/commit.txt';
const releaseFile = 'build-configs/release-id.txt';
const tagFile = 'build-configs/image-tag.txt';

const handleErr = err => {
  if (!err) return;
  console.error(`Error: ${err}`);
  process.exit(1);
};

fs.readFile(versionFile, 'utf8', function(err, commit) {
  const tag = 'master';
  const releaseId = `master/${commit}`;
  const args = {
    PUBLIC_URL: `/rex/releases/${releaseId}`,
    REACT_APP_CODE_VERSION: commit,
    REACT_APP_RELEASE_ID: releaseId,
  };

  console.log('Generating build arg file...');
  console.log(JSON.stringify(args, null, 2));
  fs.writeFile(argFile, JSON.stringify(args), handleErr);

  console.log(`Generating commit file with: ${commit}`);
  fs.writeFile(commitFile, commit, handleErr);

  console.log(`Generating release id file with: ${releaseId}`);
  fs.writeFile(releaseFile, releaseId, handleErr);

  console.log(`Generating tag file with: ${tag}`);
  fs.writeFile(tagFile, tag, handleErr);
});
