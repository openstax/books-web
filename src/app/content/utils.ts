import { OSWebBook } from '../../gateways/createOSWebLoader';
import { AppServices } from '../types';
import { ArchiveBook, Book } from './types';
import { stripIdVersion } from './utils/idUtils';

export { findDefaultBookPage, flattenArchiveTree } from './utils/archiveTreeUtils';
export { getBookPageUrlAndParams, getPageIdFromUrlParam, getUrlParamForPageId, toRelativeUrl } from './utils/urlUtils';
export { stripIdVersion } from './utils/idUtils';
export { scrollSidebarSectionIntoView } from './utils/domUtils';

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

export const makeUnifiedBookLoader = (
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader']
) => async(bookId: string, bookVersion: string) => {
  const bookLoader = archiveLoader.book(bookId, bookVersion);
  const osWebBook = await osWebLoader.getBookFromId(bookId);
  const archiveBook = await bookLoader.load();

  return formatBookData(archiveBook, osWebBook);
};
