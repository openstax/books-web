'use strict';

const { Gatherer } = require('lighthouse');

module.exports = class UniqueIds extends Gatherer {
  static get meta() {
    return {
      id: UniqueIds.name,
      title: 'Element ids are unique',
      failureTitle: 'Duplicate or invalid id',
      description: 'Used to ensure that each id attribute is unique to the page.',

      // The name of the custom gatherer class that provides input to this audit.
      requiredArtifacts: [UniqueIds.name],
    };
  }

  static audit(artifacts) {
    const ids = artifacts[UniqueIds.name];
    const areUnique = ids.length === new Set(ids).size;
    return {
      rawValue: ids,
      score: Number(areUnique),
    };
  }

  // Gatherer function
  async afterPass({ driver }) {
    const fn = () => {
      const elementsWithId = document.querySelectorAll('[id]');
      return [...elementsWithId].map(el => el.getAttribute('id'))
    };
    return driver.evaluateAsync(`((${fn.toString()}) ())`);
  }
}
