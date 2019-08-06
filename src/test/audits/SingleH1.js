'use strict';

const { Gatherer } = require('lighthouse');

// This does not follow the recommended Lighthouse pattern of separating the Audit from the Gatherer.
// Instead, it combines both into 1 class to reduce copy/pasta.
module.exports = class SingleH1 extends Gatherer {
  static get meta() {
    return {
      id: SingleH1.name,
      title: 'Contains exactly 1 <h1> element',
      failureTitle: 'Did not contain exactly 1 <h1> element',
      description: 'Used to ensure that each page contains exactly one <h1> element.',

      // The name of the custom gatherer class that provides input to this audit.
      requiredArtifacts: [SingleH1.name],
    };
  }

  static audit(artifacts) {
    const h1Count = artifacts[SingleH1.name];
    const isSingle = h1Count === 1;

    return {
      rawValue: h1Count,
      score: Number(isSingle), // Cast true/false to 1/0
    };
  }

  // Gatherer function
  async afterPass({ driver }) {
    return driver.evaluateAsync('document.querySelectorAll("h1").length');
  }
}
