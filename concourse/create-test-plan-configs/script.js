#!/usr/bin/env node

const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

const baseUrlCheck = /base url: (http.*?openstax.org)/;
const outdir = process.argv[2];

const {TR_USERNAME, TR_PASSWORD, TR_PROJECT_ID, TR_INSTANCE} = process.env;

const headers = {
  'Authorization': 'Basic ' + Buffer.from(TR_USERNAME + ':' + TR_PASSWORD).toString('base64'),
  'Content-Type': 'application/json',
}

const testrailApi = `https://${TR_INSTANCE}.testrail.net/index.php?/api/v2`;

const log = thing => {
  console.log(thing);
  return thing;
};

const processPlan = plan => {
  if (!baseUrlCheck.test(plan.description)) {
    console.log(`plan: ${plan.name} doesn't define a base url, skipping`);
    return;
  }

  const baseUrl = plan.description.match(baseUrlCheck)[1];

  for (const suites of plan.entries) {
    for (const run of suites.runs) {
      const dest = path.resolve(outdir, '' + run.id);
      const runIdFile = path.resolve(dest, 'run_id.txt');
      const baseUrlFile = path.resolve(dest, 'base_url.txt');
      const browserFile = path.resolve(dest, 'browser.txt');

      fs.mkdirSync(dest);

      console.log(`writing ${run.id} to ${runIdFile}`);
      fs.writeFileSync(runIdFile, run.id);
      console.log(`writing ${baseUrl} to ${baseUrlFile}`);
      fs.writeFileSync(baseUrlFile, baseUrl);
      console.log(`writing ${run.config} to ${browserFile}`);
      fs.writeFileSync(browserFile, run.config);
    }
  }
};

const mapPlans = plans => Promise.all(plans.map(planSummary =>
  fetch(`${testrailApi}/get_plan/${planSummary.id}`, {headers})
    .then(response => response.json())
    .then(processPlan)
));


fetch(`${testrailApi}/get_plans/${TR_PROJECT_ID}`, {headers})
  .then(response => response.json())
  .then(log)
  .then(mapPlans)
  .catch(err => {
    console.error(err);
    process.exit(1)
  })
;
