import css from 'cnx-recipes/styles/output/intro-business.json';
import { routeHook } from '../../navigation/utils';
import { AppServices, FirstArgumentType, MiddlewareAPI } from '../../types';
import { receiveBook, receivePage, requestBook, requestPage } from '../actions';
import { content } from '../routes';
import * as select from '../selectors';
import { ArchiveBook, ArchivePage } from '../types';
import { flattenArchiveTree, getContentPageReferences } from '../utils';

const fontMatches = css.match(/"(https:\/\/fonts\.googleapis\.com\/css\?family=.*?)"/);
const fonts = fontMatches ? fontMatches.slice(1) : [];

export default routeHook(content, (services) => async({match}) => {
  const {dispatch, getState, fontCollector, archiveLoader} = services;
  const state = getState();
  const {bookId, pageId} = match.params;
  const book = select.book(state);
  const page = select.page(state);
  const promises: Array<Promise<any>> = [];
  let bookPromise: Promise<ArchiveBook> | undefined;

  fonts.forEach((font) => fontCollector.add(font));

  const [bookRefId, bookRefVersion, pageRefId] = match.state
    ? [match.state.bookUid, match.state.bookVersion, match.state.pageUid]
    : [bookId, undefined, pageId];

  const archiveBookLoader = archiveLoader.book(bookRefId, bookRefVersion);

  if ((!book || book.shortId !== bookId) && bookId !== select.loadingBook(state)) {
    dispatch(requestBook(bookId));
    bookPromise = archiveBookLoader.load().then((bookData) => dispatch(receiveBook(bookData)) && bookData);
    promises.push(bookPromise);
  }

  if ((!page || page.shortId !== pageId) && pageId !== select.loadingPage(state)) {
    dispatch(requestPage(pageId));
    promises.push(
      archiveBookLoader.page(pageRefId).load()
        .then((pageData) => (bookPromise ? bookPromise.then(() => pageData) : Promise.resolve(pageData))
          .then(loadContentReferences(services))
        )
        .then((pageData) => dispatch(receivePage(pageData)))
    );
  }

  await Promise.all(promises);
});

const loadContentReferences = ({archiveLoader, getState}: AppServices & MiddlewareAPI) =>
  async(pageData: ArchivePage) => {
    const contentReferences = getContentPageReferences(pageData.content);
    const state = getState();
    const book = select.book(state);
    const bookPages = book ? flattenArchiveTree(book.tree.contents) : [];
    const references: FirstArgumentType<typeof receivePage>['references'] = [];

    if (!book) {
      throw new Error('BUG: book is required to record content references');
    }

    const archiveBookLoader = archiveLoader.book(book.id, book.version);
    const promises: Array<Promise<any>> = [];

    for (const reference of contentReferences) {
      if (reference.bookUid || reference.bookVersion) {
        throw new Error('BUG: Cross book references are not supported');
      }
      if (!bookPages.find((page) => page.id === reference.pageUid)) {
        throw new Error(`BUG: ${reference.pageUid} is not present in the ToC`);
      }

      promises.push(
        archiveBookLoader.page(reference.pageUid).load()
          .then((referenceData) => references.push({
            match: reference.match,
            params: {
              bookId: book.shortId,
              pageId: referenceData.shortId,
            },
            state: {
              bookUid: book.id,
              bookVersion: book.version,
              pageUid: referenceData.id,
            },
          }))
      );
    }

    await Promise.all(promises);

    return {
      ...pageData,
      references,
    };
  };
