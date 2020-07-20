import { CANONICAL_MAP } from '../../../canonicalBookMap';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { book, page } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { setHead } from '../../head/actions';
import { MiddlewareAPI, Store } from '../../types';
import { receiveBook, receivePage, requestBook, requestPage } from '../actions';
import { formatBookData } from '../utils';
import * as archiveUtils from '../utils/archiveTreeUtils';
import * as seoUtils from '../utils/seoUtils';

const mockConfig = {BOOKS: {
 [book.id]: {defaultVersion: book.version},
} as {[key: string]: {defaultVersion: string}}};

jest.doMock('../../../config', () => mockConfig);

describe('setHead hook', () => {
  let getCanonicalUrlParams: typeof import ('../utils/canonicalUrl').getCanonicalUrlParams;
  const combinedBook = formatBookData(book, mockCmsBook);
  let hook: ReturnType<typeof import ('./receiveContent').default>;
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: MiddlewareAPI & ReturnType<typeof createTestServices>;

  beforeEach(() => {
    getCanonicalUrlParams = require('../utils/canonicalUrl').getCanonicalUrlParams;
    store = createTestStore();

    dispatch = jest.spyOn(store, 'dispatch');

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    hook = require('./receiveContent').default(helpers);
  });

  it('dispatches setHead when receivePage is dispatched', async() => {
    store.dispatch(receiveBook(combinedBook));
    store.dispatch(receivePage({...page, references: []}));

    await hook(receivePage({...page, references: []}));

    expect(dispatch).toHaveBeenCalledWith(setHead(expect.anything()));
  });

  it('does nothing if book is loading', async() => {
    store.dispatch(receiveBook(combinedBook));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(requestBook({
        slug: 'asdf',
    }));

    await hook(receivePage({...page, references: []}));

    expect(dispatch).not.toHaveBeenCalledWith(setHead(expect.anything()));
  });

  it('does nothing if page is loading', async() => {
    store.dispatch(receiveBook(combinedBook));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(requestPage({slug: 'asdf'}));

    await hook(receivePage({...page, references: []}));

    expect(dispatch).not.toHaveBeenCalledWith(setHead(expect.anything()));
  });

  it('does nothing if page is not loaded', async() => {
    store.dispatch(receiveBook(combinedBook));

    await hook(receivePage({...page, references: []}));

    expect(dispatch).not.toHaveBeenCalledWith(setHead(expect.anything()));
  });

  it('does nothing if book is not loaded', async() => {
    store.dispatch(receivePage({...page, references: []}));

    await hook(receivePage({...page, references: []}));

    expect(dispatch).not.toHaveBeenCalledWith(setHead(expect.anything()));
  });

  describe('meta description', () => {
    it('dispatches sethead with description tags', async() => {
      store.dispatch(receiveBook(combinedBook));
      store.dispatch(receivePage({
        ...page,
        abstract: 'foobar',
        references: [],
      }));
      const bookId = book.id;
      CANONICAL_MAP[bookId] = [ [bookId, {}] ];

      await hook(receivePage({
        ...page,
        abstract: 'foobar',
        references: [],
      }));

      expect(dispatch).toHaveBeenCalledWith(setHead(expect.objectContaining({
        meta: expect.arrayContaining([
          {name: 'description', content: 'foobar'},
          {property: 'og:description', content: 'foobar'},
        ]),
      })));
    });
    it('always dispatches sethead with description tags', async() => {
      store.dispatch(receiveBook(book));
      store.dispatch(receivePage({
        ...page,
        abstract: undefined as any as string,
        references: [],
      }));
      const bookId = book.id;
      CANONICAL_MAP[bookId] = [ [bookId, {}] ];

      await hook(receivePage({
        ...page,
        abstract: undefined as any as string,
        references: [],
      }));

      expect(dispatch).toHaveBeenCalledWith(setHead(expect.objectContaining({
        meta: expect.arrayContaining([
          expect.objectContaining({name: 'description'}),
          expect.objectContaining({property: 'og:description'}),
        ]),
      })));
    });
  });

  describe('getCanonicalURL', () => {

    afterEach(() => {
      archiveUtils.CACHED_FLATTENED_TREES.clear();
    });

    it('returns the current book when the book does not have a canonical book entry', async() => {
      const pageId = page.id;
      const x = await getCanonicalUrlParams(helpers.archiveLoader, helpers.osWebLoader, book, pageId);
      expect(x).toEqual({book: {slug: 'book-slug-1'}, page: {slug: 'test-page-1'}});
    });

    it('finds a canonical book for a page', async() => {
      const bookId = book.id;
      const pageId = page.id;
      CANONICAL_MAP[bookId] = [ [bookId, {}] ];
      const x = await getCanonicalUrlParams(helpers.archiveLoader, helpers.osWebLoader, book, pageId);
      expect(x).toEqual({book: {slug: 'book-slug-1'}, page: {slug: 'test-page-1'}});
    });

    it('finds a canonical book and canonical page', async() => {
      const bookId = book.id;
      const pageId = page.id;
      CANONICAL_MAP[bookId] = [ [bookId, { [pageId]: 'new-id' }] ];

      const node = archiveUtils.findArchiveTreeNodeById(book.tree, pageId);
      node!.slug = 'new-id';
      const spy = jest.spyOn(archiveUtils, 'findArchiveTreeNodeById')
        .mockReturnValueOnce(node);

      const res = await getCanonicalUrlParams(helpers.archiveLoader, helpers.osWebLoader, book, pageId);

      expect(spy).toHaveBeenCalledWith(book.tree, 'new-id');
      expect(res).toEqual({book: {slug: 'book-slug-1'}, page: {slug: 'new-id'}});
    });

    it('throws if canonical book is missing cms data', async() => {
      helpers.osWebLoader.getBookFromId.mockImplementation(() => Promise.resolve(undefined) as any);

      const bookId = book.id;
      const pageId = page.id;
      CANONICAL_MAP[bookId] = [ [bookId, {}] ];

      await expect(getCanonicalUrlParams(
        helpers.archiveLoader,
        helpers.osWebLoader,
        book,
        pageId
      )).rejects.toThrow(`could not load cms data for book: ${bookId}`);
    });

    it('doesn\'t add link when canonical is null', async() => {
      const bookId = book.id;
      const pageId = 'unique-snowflake-page';
      CANONICAL_MAP[bookId] = [ [bookId, {}] ];

      jest.spyOn(seoUtils, 'createTitle')
        .mockReturnValue('mock seo title');

      store.dispatch(receiveBook(combinedBook));
      store.dispatch(receivePage({...page, references: [], id: pageId}));

      await hook(receivePage({...page, references: [], id: pageId}));

      expect(dispatch).toHaveBeenCalledWith(setHead({
        links: [],
        meta: expect.anything(),
        title: expect.anything(),
      }));
    });

    it('adds <link rel="canonical">', async() => {
      const bookId = book.id;
      CANONICAL_MAP[bookId] = [ [bookId, {}] ];

      store.dispatch(receiveBook(combinedBook));
      store.dispatch(receivePage({...page, references: []}));

      await hook(receivePage({...page, references: []}));

      expect(dispatch).toHaveBeenCalledWith(setHead({
        links: [{rel: 'canonical', href: 'https://openstax.org/books/book-slug-1/pages/test-page-1'}],
        meta: expect.anything(),
        title: expect.anything(),
      }));
    });
  });
});
