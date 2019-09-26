import { BOOKS } from '../../../../config';
import { Match } from '../../../navigation/types';
import { AppServices, MiddlewareAPI } from '../../../types';
import { assertDefined } from '../../../utils';
import { receiveBook, receivePage, requestBook, requestPage } from '../../actions';
import { content } from '../../routes';
import * as select from '../../selectors';
import { ArchivePage, Book, PageReferenceMap } from '../../types';
import {
  formatBookData,
  getContentPageReferences,
  getPageIdFromUrlParam,
  getUrlParamForPageId
} from '../../utils';
import { archiveTreeContainsNode } from '../../utils/archiveTreeUtils';

export default async(
  services: AppServices & MiddlewareAPI,
  match: Match<typeof content>
) => {
  const [book, loader] = await resolveBook(services, match);
  const page = await resolvePage(services, match, book, loader);

  return {book, page};
};

const getBookResponse = async(
  osWebLoader: AppServices['osWebLoader'],
  archiveLoader: AppServices['archiveLoader'],
  loader: ReturnType<AppServices['archiveLoader']['book']>,
  bookSlug: string
): Promise<[Book, ReturnType<AppServices['archiveLoader']['book']>]>  => {
  const osWebBook = await osWebLoader.getBookFromSlug(bookSlug);
  const archiveBook = await loader.load();
  const newBook = formatBookData(archiveBook, osWebBook);
  return [newBook, archiveLoader.book(newBook.id, newBook.version)];
};

const resolveBook = async(
  services: AppServices & MiddlewareAPI,
  match: Match<typeof content>
): Promise<[Book, ReturnType<AppServices['archiveLoader']['book']>]> => {
  const {dispatch, getState, archiveLoader, osWebLoader} = services;
  const [bookSlug, bookId, bookVersion] = await resolveBookReference(services, match);

  const loader = archiveLoader.book(bookId, bookVersion);
  const state = getState();
  const bookState = select.book(state);
  const book = bookState && bookState.id === bookId ? bookState : undefined;

  if (book) {
    return [book, loader];
  }

  if (bookSlug !== select.loadingBook(state)) {
    dispatch(requestBook(bookSlug));
    const response = await getBookResponse(osWebLoader, archiveLoader, loader, bookSlug);
    dispatch(receiveBook(response[0]));
    return response;
  } else {
    return await getBookResponse(osWebLoader, archiveLoader, loader, bookSlug);
  }
};

const resolveBookReference = async(
  {osWebLoader, getState}: AppServices & MiddlewareAPI,
  match: Match<typeof content>
): Promise<[string, string, string]> => {
  const state = getState();
  const bookSlug = match.params.book;
  const currentBook = select.book(state);

  if (match.state && match.state.bookUid && match.state.bookVersion) {
    return [bookSlug, match.state.bookUid, match.state.bookVersion];
  }

  const bookUid = currentBook && currentBook.slug === bookSlug
    ? currentBook.id
    : await osWebLoader.getBookIdFromSlug(bookSlug);

  const bookVersion = assertDefined(BOOKS[bookUid], `BUG: ${bookSlug} (${bookUid}) is not in BOOKS configuration`
  ).defaultVersion;

  return [bookSlug, bookUid, bookVersion];
};

const loadPage = async(
  services: AppServices & MiddlewareAPI,
  match: Match<typeof content>,
  book: Book,
  bookLoader: ReturnType<AppServices['archiveLoader']['book']>,
  pageId: string
) => {
  services.dispatch(requestPage(match.params.page));
  return await bookLoader.page(pageId).load()
    .then(loadContentReferences(services, book))
    .then((pageData) => services.dispatch(receivePage(pageData)) && pageData)
  ;
};

const resolvePage = async(
  services: AppServices & MiddlewareAPI,
  match: Match<typeof content>,
  book: Book,
  bookLoader: ReturnType<AppServices['archiveLoader']['book']>
) => {
  const {getState} = services;
  const state = getState();
  const pageId = match.state && match.state.pageUid
    ? match.state.pageUid
    : getPageIdFromUrlParam(book, match.params.page);

  if (!pageId) {
    // TODO - 404 handling
    // content links within the content are audited before they're clicked
    // and other content links come from the ToC, so if we've gotten
    // this far and the page is not found an exception is probably fine.
    // maybe just a _better_ exception
    throw new Error('Page not found');
  }

  const pageState = select.page(state);
  if (pageState && pageState.id === pageId) {
    return pageState;
  } else if (match.params.page !== select.loadingPage(state)) {
    return await loadPage(services, match, book, bookLoader, pageId);
  }
};

const resolveExternalBookReference = async(
  {archiveLoader, osWebLoader}: AppServices & MiddlewareAPI,
  book: Book,
  page: ArchivePage,
  pageId: string
) => {
  const bookId = (await archiveLoader.getBookIdsForPage(pageId)).filter((id) => BOOKS[id])[0];
  const error = (message: string) => new Error(
    `BUG: "${book.title} / ${page.title}" referenced "${pageId}", ${message}`
  );

  if (!bookId) {
    throw error('but it could not be found in any configured books.');
  }

  const bookVersion = BOOKS[bookId].defaultVersion;

  const osWebBook = await osWebLoader.getBookFromId(bookId);
  const archiveBook = await archiveLoader.book(bookId, bookVersion).load();
  const referencedBook = formatBookData(archiveBook, osWebBook);

  if (!archiveTreeContainsNode(referencedBook.tree, pageId)) {
    throw error(`archive thought it would be in "${referencedBook.id}", but it wasn't`);
  }

  return referencedBook;
};

const loadContentReference = async(
  services: AppServices & MiddlewareAPI,
  book: Book,
  page: ArchivePage,
  reference: ReturnType<typeof getContentPageReferences>[0]
) => {
  const targetBook: Book = archiveTreeContainsNode(book.tree, reference.pageUid)
    ? book
    : await resolveExternalBookReference(services, book, page, reference.pageUid);

  return {
    match: reference.match,
    params: {
      book: targetBook.slug,
      page: getUrlParamForPageId(targetBook, reference.pageUid),
    },
    state: {
      bookUid: targetBook.id,
      bookVersion: targetBook.version,
      pageUid: reference.pageUid,
    },
  };
};

const loadContentReferences = (services: AppServices & MiddlewareAPI, book: Book) => async(page: ArchivePage) => {
  const contentReferences = getContentPageReferences(page.content);
  const references: PageReferenceMap[] = [];

  for (const reference of contentReferences) {
    references.push(await loadContentReference(services, book, page, reference));
  }

  return {
    ...page,
    references,
  };
};
