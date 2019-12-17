import { OSWebBook } from '../../gateways/createOSWebLoader';
import { AppServices } from '../types';
import { ArchiveBook, Book, BookSections, Page } from './types';
import {
  archiveTreeSectionIsBook,
  archiveTreeSectionIsChapter,
  findArchiveTreeNode,
  flattenArchiveTree,
} from './utils/archiveTreeUtils';
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

export const preloadedPageIdIs = (window: Window, id: string) => window.__PRELOADED_STATE__
  && window.__PRELOADED_STATE__.content
  && window.__PRELOADED_STATE__.content.page
  && window.__PRELOADED_STATE__.content.page.id === id;

export const mapBookSections = (book: Book) => {
  return new Map(flattenArchiveTree(book.tree).filter((section) =>
    (section.parent && archiveTreeSectionIsBook(section.parent))
    || archiveTreeSectionIsChapter(section)).map((s) => [s.id, s]));
};

export const getCurrentChapter = (sections: BookSections, page: Page) => {
  let chapter = sections.get(page.id);

  if (!chapter) {
    for (const section of sections.values()) {
      if (archiveTreeSectionIsChapter(section) && findArchiveTreeNode(section, page.id)) {
        chapter = section;
        break;
      }
    }
  }

  return chapter;
};
