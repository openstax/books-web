import { OSWebBook } from '../../gateways/createOSWebLoader';
import { ArchiveBook, Book } from './types';
import { stripIdVersion } from './utils/idUtils';

export { findDefaultBookPage, flattenArchiveTree } from './utils/archiveTreeUtils';
export { getBookPageUrlAndParams, getPageIdFromUrlParam, getUrlParamForPageId, toRelativeUrl } from './utils/urlUtils';
export { stripIdVersion } from './utils/idUtils';
export { scrollTocSectionIntoView } from './utils/domUtils';

export const getContentPageReferences = (content: string) =>
  (content.match(/"\/contents\/([a-z0-9-]+(@[\d.]+)?)/g) || [])
    .map((match) => {
      const pageId = match.substr(11);

      return {
        match: match.substr(1),
        pageUid: stripIdVersion(pageId),
      };
    });

export const formatBookData = (archiveBook: ArchiveBook, osWebBook: OSWebBook): Book => ({
  ...archiveBook,
  authors: osWebBook.authors,
  publish_date: osWebBook.publish_date,
  slug: osWebBook.meta.slug,
  theme: osWebBook.cover_color,
});
