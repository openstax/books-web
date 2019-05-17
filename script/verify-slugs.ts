import fetch from 'node-fetch';
import { flattenArchiveTree } from '../src/app/content/utils/archiveTreeUtils';
import { getUrlParamForPageTitle } from '../src/app/content/utils/urlUtils';

const bookUrl = process.argv[3];

fetch(bookUrl)
  .then((response) => response.json())
  .then(({tree}) => {
    const sections = flattenArchiveTree(tree);

    for (const section of sections) {
      const rexSlug = getUrlParamForPageTitle(section);

      if (rexSlug !== section.slug) {
        console.log(`
pageId: ${section.id}
rexSlug: ${rexSlug}
cnxSlug: ${section.slug}
        `);
      }
    }
  });
