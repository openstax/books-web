import { OSWebBook } from '../../gateways/createOSWebLoader';
import { AppServices } from '../types';
import { hasOSWebData, isArchiveTree } from './guards';
import {
  ArchiveBook,
  ArchiveTree,
  ArchiveTreeNode,
  Book,
  BookWithOSWebData,
  Params,
  SlugParams,
  UuidParams,
} from './types';
import { CACHED_FLATTENED_TREES, getTitleFromArchiveNode } from './utils/archiveTreeUtils';
import { stripIdVersion } from './utils/idUtils';

export { findDefaultBookPage, flattenArchiveTree } from './utils/archiveTreeUtils';
export { getBookPageUrlAndParams, getPageIdFromUrlParam, getUrlParamForPageId, toRelativeUrl } from './utils/urlUtils';
export { stripIdVersion } from './utils/idUtils';
export { scrollSidebarSectionIntoView } from './utils/domUtils';

export interface ContentPageRefencesType {
  bookId: string;
  bookVersion?: string;
  match: string;
  pageId: string;
}

export function getContentPageReferences(htmlContent: string) {
  const matches: ContentPageRefencesType[] = (htmlContent.match(/.\/([a-z0-9-]+(@[\d.]+)?):([a-z0-9-]+.xhtml)/g) || [])
    .map((match) => {
      const [bookMatch, pageMatch] = match.split(':');
      const pageId = pageMatch.split('.xhtml')[0];
      const [bookId, bookVersion] = bookMatch.split('@') as [string, string | undefined];

      return {
        bookId: bookId.substr(2),
        bookVersion,
        match,
        pageId: stripIdVersion(pageId),
      };
    });

  return matches;
}

export const parseContents = (book: Book, contents: Array<ArchiveTree | ArchiveTreeNode>) => {
  contents.map((subtree) => {
    subtree.title = getTitleFromArchiveNode(book, subtree);
    if (isArchiveTree(subtree)) {
      subtree.contents = parseContents(book, subtree.contents);
    }
    return subtree;
  });

  CACHED_FLATTENED_TREES.clear();
  // getTitleFromArchiveNode is using `flattenArchiveTree` util that is caching old titles
  // so we have to clear this cache after transforming titles
  // without this everytime when we call functions like findArchiveNodeById we would get old titles, before parsing

  return contents;
};

const pickArchiveFields = (archiveBook: ArchiveBook) => ({
  id: archiveBook.id,
  license: archiveBook.license,
  revised: archiveBook.revised,
  title: archiveBook.title,
  tree: {
    ...archiveBook.tree,
    contents: parseContents(archiveBook, archiveBook.tree.contents),
  },
  version: archiveBook.version,
});

export const formatBookData = <O extends OSWebBook | undefined>(
  archiveBook: ArchiveBook,
  osWebBook: O
): O extends OSWebBook ? BookWithOSWebData : ArchiveBook => {
  if (osWebBook === undefined) {
    // as any necessary https://github.com/Microsoft/TypeScript/issues/13995
    return pickArchiveFields(archiveBook) as ArchiveBook as any;
  }
  return {
    ...pickArchiveFields(archiveBook),
    amazon_link: osWebBook.amazon_link,
    authors: osWebBook.authors,
    book_state: osWebBook.book_state,
    publish_date: osWebBook.publish_date,
    slug: osWebBook.meta.slug,
    theme: osWebBook.cover_color,
  // as any necessary https://github.com/Microsoft/TypeScript/issues/13995
  } as BookWithOSWebData as any;
};

export const makeUnifiedBookLoader = (
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader']
) => async(bookId: string, bookVersion: string) => {
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

export const getIdFromPageParam = (param: Params['page'] | null) => {
  if (!param) { return ''; }
  return (param as SlugParams).slug || (param as UuidParams).uuid;
};
