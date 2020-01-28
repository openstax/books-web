import { Location } from 'history';
import { OSWebBook } from '../../../gateways/createOSWebLoader';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { book, page } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { resetModules } from '../../../test/utils';
import { recordError } from '../../errors/actions';
import { Match } from '../../navigation/types';
import { MiddlewareAPI, Store } from '../../types';
import * as actions from '../actions';
import { receiveBook, receivePage } from '../actions';
import * as routes from '../routes';
import { formatBookData } from '../utils';

const mockConfig = {BOOKS: {
 [book.id]: {defaultVersion: book.version},
} as {[key: string]: {defaultVersion: string}}};

jest.doMock('../../../config', () => mockConfig);

describe('locationChange', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let payload: {location: Location, match: Match<typeof routes.content>};
  let hook = require('./locationChange').default;

  beforeEach(() => {
    resetModules();
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    payload = {
      location: {} as Location,
      match: {
        params: {
          book: 'book-slug-1',
          page: 'test-page-1',
        },
        route: routes.content,
      },
    };

    hook = (require('./locationChange').default)(helpers);
  });

  it('loads book', async() => {
    await hook(payload);
    expect(dispatch).toHaveBeenCalledWith(actions.requestBook({book: 'book-slug-1', page: 'test-page-1'}));
    expect(helpers.archiveLoader.mock.loadBook).toHaveBeenCalledWith('testbook1-uuid', '1.0');
  });

  it('doesn\'t load book if its already loaded', async() => {
    store.dispatch(receiveBook(formatBookData(book, {...mockCmsBook, meta: {slug: 'book'}})));
    await hook(payload);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestBook({book: 'book', page: 'test-page-1'}));
    expect(helpers.archiveLoader.mock.loadBook).not.toHaveBeenCalled();
  });

  it('loads page', async() => {
    await hook(payload);
    expect(dispatch).toHaveBeenCalledWith(actions.requestPage('test-page-1'));
    expect(helpers.archiveLoader.mock.loadPage)
      .toHaveBeenCalledWith('testbook1-uuid', '1.0', 'testbook1-testpage1-uuid');
  });

  it('doesn\'t load page if its already loaded', async() => {
    store.dispatch(receivePage({...page, references: []}));

    await hook(payload);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestPage(expect.anything()));
    expect(helpers.archiveLoader.mock.loadPage).not.toHaveBeenCalled();
    expect(helpers.archiveLoader.mock.loadBook).not.toHaveBeenCalledWith('page', expect.anything());
    expect(helpers.archiveLoader.mock.loadBook).not.toHaveBeenCalledWith('pagelongid', expect.anything());
  });

  it('loads more specific data when available', async() => {
    payload.match.state = {
      bookUid: 'testbook1-uuid',
      bookVersion: '1.0',
      pageUid: 'testbook1-testpage1-uuid',
    };

    await hook(payload);
    expect(helpers.archiveLoader.mock.loadBook).toHaveBeenCalledWith('testbook1-uuid', '1.0');
    expect(helpers.archiveLoader.mock.loadPage)
      .toHaveBeenCalledWith('testbook1-uuid', '1.0', 'testbook1-testpage1-uuid');
  });

  it('loads a page with a content reference', async() => {
    helpers.archiveLoader.mockPage(book, {
      abstract: '',
      content: 'rando content',
      id: 'rando-page-id',
      revised: '2018-07-30T15:58:45Z',
      shortId: 'rando-page-shortid',
      title: 'rando page',
      version: '0',
    }, 'rando-page');
    helpers.archiveLoader.mockPage(book, {
      abstract: '',
      content: 'some <a href="/contents/rando-page-id"></a> content',
      id: 'asdfasfasdfasdf',
      revised: '2018-07-30T15:58:45Z',
      shortId: 'asdf',
      title: 'qwerqewrqwer',
      version: '0',
    }, 'qwerqewrqwer');

    payload.match.params.page = 'qwerqewrqwer';

    payload.match.state = {
      bookUid: 'testbook1-uuid',
      bookVersion: '1.0',
      pageUid: 'asdfasfasdfasdf',
    };

    await hook(payload);

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({payload: expect.objectContaining({references: [{
      match: '/contents/rando-page-id',
      params: {
        book: 'book-slug-1',
        page: 'rando-page',
      },
      state: {
        bookUid: 'testbook1-uuid',
        bookVersion: '1.0',
        pageUid: 'rando-page-id',
      },
    }]})}));
  });

  it('throws on unknown id', async() => {
    payload.match.params.page = 'garbage';
    await hook(payload);

    expect(dispatch).toHaveBeenCalledWith(recordError({error: new Error('page not found')}));
  });

  it('loads book details from osweb', async() => {
    await hook(payload);
    expect(helpers.osWebLoader.getBookIdFromSlug).toHaveBeenCalledWith('book-slug-1');
  });

  it('caches book details from osweb', async() => {
    await hook(payload);
    await hook(payload);
    expect(helpers.osWebLoader.getBookIdFromSlug).toHaveBeenCalledTimes(1);
  });

  it('doesn\'t call osweb if book slug is already known', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    await hook(payload);
    expect(helpers.osWebLoader.getBookIdFromSlug).not.toHaveBeenCalled();
  });

  describe('cross book references', () => {
    const mockOtherBook = {
      abstract: '',
      id: 'newbookid',
      license: {name: '', version: ''},
      shortId: 'newbookshortid',
      title: 'newbook',
      tree: {
        contents: [],
        id: 'newbookid@0',
        shortId: 'newbookshortid@0',
        slug: 'newbook',
        title: 'newbook',
      },
      version: '0',
    };
    const mockPageInOtherBook = {
      abstract: '',
      content: 'dope content bruh',
      id: 'newbookpageid',
      revised: '2018-07-30T15:58:45Z',
      shortId: 'newbookpageshortid',
      title: 'page in a new book',
      version: '0',
    };
    const mockCmsOtherBook: OSWebBook = {
      authors: [{value: {name: 'different author', senior_author: true}}],
      cnx_id: 'newbookid',
      cover_color: 'blue',
      meta: {
        slug: 'new-book',
      },
      publish_date: '2012-06-21',
    };

    beforeEach(() => {
      helpers.archiveLoader.mockBook(mockOtherBook);
      helpers.archiveLoader.mockPage(mockOtherBook, mockPageInOtherBook, 'page-in-a-new-book');
      mockConfig.BOOKS.newbookid = {defaultVersion: '0'};

      helpers.archiveLoader.mockPage(book, {
        abstract: '',
        content: 'some <a href="/contents/newbookpageid"></a> content',
        id: 'pageid',
        revised: '2018-07-30T15:58:45Z',
        shortId: 'pageshortid',
        title: 'page referencing different book',
        version: '0',
      }, 'page-referencing-different-book');

      payload.match.params.page = 'page referencing different book';

      payload.match.state = {
        bookUid: 'testbook1-uuid',
        bookVersion: '1.0',
        pageUid: 'pageid',
      };
    });

    it('load', async() => {
      helpers.archiveLoader.mock.getBookIdsForPage.mockReturnValue(Promise.resolve(['newbookid']));
      helpers.osWebLoader.getBookFromId.mockReturnValue(Promise.resolve(mockCmsOtherBook));

      await hook(payload);

      expect(helpers.archiveLoader.mock.getBookIdsForPage).toHaveBeenCalledWith('newbookpageid');
      expect(helpers.osWebLoader.getBookFromId).toHaveBeenCalledWith('newbookid');

      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({payload: expect.objectContaining({references: [{
        match: '/contents/newbookpageid',
        params: {
          book: 'new-book',
          page: 'page-in-a-new-book',
        },
        state: {
          bookUid: 'newbookid',
          bookVersion: '0',
          pageUid: 'newbookpageid',
        },
      }]})}));
    });

    it('error when the page is not in any configured book', async() => {
      helpers.archiveLoader.mock.getBookIdsForPage.mockReturnValue(Promise.resolve(['garbagebookid']));

      let message: string | undefined;

      try {
        await hook(payload);
      } catch (e) {
        message = e.message;
      }

      expect(message).toEqual(
        'BUG: "Test Book 1 / page referencing different book" referenced "newbookpageid"' +
        ', but it could not be found in any configured books.'
      );
    });

    it('error when archive returns a book that doesn\'t actually contain the page', async() => {
      helpers.archiveLoader.mockBook({
        id: 'garbagebookid',
        license: {name: '', version: ''},
        shortId: 'garbagebookshortid',
        title: 'book without the page you\'re looking for',
        tree: {
          contents: [],
          id: 'garbagebookid@0',
          shortId: 'garbagebookshortid@0',
          slug: 'garbage-book',
          title: 'garbage book',
        },
        version: '0',
      });
      helpers.archiveLoader.mock.getBookIdsForPage.mockReturnValue(Promise.resolve(['garbagebookid']));
      mockConfig.BOOKS.garbagebookid = {defaultVersion: '0'};
      helpers.osWebLoader.getBookFromId.mockReturnValue(Promise.resolve(mockCmsOtherBook));

      let message: string | undefined;

      try {
        await hook(payload);
      } catch (e) {
        message = e.message;
      }

      expect(message).toEqual(
        'BUG: "Test Book 1 / page referencing different book" referenced "newbookpageid"' +
        ', archive thought it would be in "garbagebookid", but it wasn\'t'
      );
    });
  });
});
