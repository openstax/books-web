import { OSWebBook } from '../../gateways/createOSWebLoader';
import { AppServices } from '../types';
import { hasOSWebData } from './guards';
import { ArchiveBook, BookWithOSWebData } from './types';
import { stripIdVersion } from './utils/idUtils';
import { assertNotNull } from '../utils';

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

const parseBookTree = (archiveBook: ArchiveBook) => {
  archiveBook.tree.contents = archiveBook.tree.contents.map((subtree) => {
    const domNode = new DOMParser().parseFromString(`<div id="container">${subtree.title}</div>`, 'text/html');
    const container = domNode.getElementById('container');
    const extra = container.querySelector('.os-part-text');

    if (extra) {
      assertNotNull(extra.parentElement, '.os-part-text must have a parent').removeChild(extra);
    }

    subtree.title = container.innerHTML;
    return subtree;
  });
  return archiveBook;
};

export const formatBookData = <O extends OSWebBook | undefined>(
  archiveBook: ArchiveBook,
  osWebBook: O
): O extends OSWebBook ? BookWithOSWebData : ArchiveBook => {
  if (osWebBook === undefined) {
    // as any necessary https://github.com/Microsoft/TypeScript/issues/13995
    return parseBookTree(archiveBook) as ArchiveBook as any;
  }

  return {
      ...parseBookTree(archiveBook),
      amazon_link: osWebBook.amazon_link,
      authors: osWebBook.authors,
      publish_date: osWebBook.publish_date,
      slug: osWebBook.meta.slug,
      theme: osWebBook.cover_color,
    // as any necessary https://github.com/Microsoft/TypeScript/issues/13995
    } as BookWithOSWebData as any;
};

export const makeUnifiedBookLoader = (
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader']
) => async(bookId: string, bookVersion?: string) => {
  const bookLoader = archiveLoader.book(bookId, bookVersion);
  const osWebBook = await osWebLoader.getBookFromId(bookId);
  const archiveBook = await bookLoader.load();

  const book = formatBookData(archiveBook, osWebBook);

  if (!hasOSWebData(book)) {
    throw new Error(`could not load cms data for book: ${bookId}`);
  }

  return book;
};

export const preloadedPageIdIs = (window: Window, id: string) => window.__PRELOADED_STATE__
  && window.__PRELOADED_STATE__.content
  && window.__PRELOADED_STATE__.content.page
  && window.__PRELOADED_STATE__.content.page.id === id;
