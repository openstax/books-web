import { Location } from 'history';
import cloneDeep from 'lodash/fp/cloneDeep';
import { combineReducers, createStore } from 'redux';
import FontCollector from '../../../helpers/FontCollector';
import PromiseCollector from '../../../helpers/PromiseCollector';
import mockArchiveLoader, { book, page } from '../../../test/mocks/archiveLoader';
import mockOSWebLoader from '../../../test/mocks/osWebLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { Match } from '../../navigation/types';
import { AppServices, AppState, MiddlewareAPI } from '../../types';
import * as actions from '../actions';
import reducer, { initialState } from '../reducer';
import * as routes from '../routes';
import { State } from '../types';
import { formatBookData } from '../utils';

const mockConfig = {BOOKS: {
 [book.id]: {defaultVersion: book.version},
} as {[key: string]: {defaultVersion: string}}};

jest.mock('../../../config', () => mockConfig);

describe('locationChange', () => {
  let localState: State;
  let appState: AppState;
  let archiveLoader: ReturnType<typeof mockArchiveLoader>;
  let osWebLoader: ReturnType<typeof mockOSWebLoader>;
  let dispatch: jest.SpyInstance;
  let helpers: MiddlewareAPI & AppServices;
  let payload: {location: Location, match: Match<typeof routes.content>};
  let hook = require('./locationChange').default;

  beforeEach(() => {
    localState = cloneDeep(initialState);
    appState = {content: localState} as AppState;

    const store = createStore(combineReducers({content: reducer}), appState);

    archiveLoader = mockArchiveLoader();
    osWebLoader = mockOSWebLoader();

    dispatch = jest.fn((action) => store.dispatch(action));

    helpers = {
      archiveLoader,
      dispatch,
      fontCollector: new FontCollector(),
      getState: store.getState,
      osWebLoader,
      promiseCollector: new PromiseCollector(),
    } as any as MiddlewareAPI & AppServices;

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

  afterEach(() => {
    jest.resetModules();
  });

  it('loads book', async() => {
    await hook(payload);
    expect(dispatch).toHaveBeenCalledWith(actions.requestBook('book-slug-1'));
    expect(archiveLoader.mock.loadBook).toHaveBeenCalledWith('testbook1-uuid', '1.0');
  });

  it('doesn\'t load book if its already loaded', async() => {
    localState.book = cloneDeep({...formatBookData(book, mockCmsBook), slug: 'book'});
    await hook(payload);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestBook('book'));
    expect(archiveLoader.mock.loadBook).not.toHaveBeenCalled();
  });

  it('doesn\'t load book if its already loading', async() => {
    archiveLoader.mock.loadBook.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(book), 100))
    );

    await Promise.all([
      hook(payload),
      hook(payload),
      hook(payload),
    ]);

    expect(dispatch).toHaveBeenCalledTimes(4);
    expect(dispatch).toHaveBeenNthCalledWith(1, actions.requestBook('book-slug-1'));
    expect(dispatch).toHaveBeenNthCalledWith(2, actions.receiveBook(expect.anything()));
    expect(dispatch).toHaveBeenNthCalledWith(3, actions.requestPage('test-page-1'));
    expect(dispatch).toHaveBeenNthCalledWith(4, actions.receivePage(expect.anything()));
  });

  it('loads page', async() => {
    await hook(payload);
    expect(dispatch).toHaveBeenCalledWith(actions.requestPage('test-page-1'));
    expect(archiveLoader.mock.loadPage).toHaveBeenCalledWith('testbook1-uuid', '1.0', 'testbook1-testpage1-uuid');
  });

  it('doesn\'t load page if its already loaded', async() => {
    localState.page = cloneDeep(page);

    await hook(payload);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestPage(expect.anything()));
    expect(archiveLoader.mock.loadPage).not.toHaveBeenCalled();
    expect(archiveLoader.mock.loadBook).not.toHaveBeenCalledWith('page', expect.anything());
    expect(archiveLoader.mock.loadBook).not.toHaveBeenCalledWith('pagelongid', expect.anything());
  });

  it('doesn\'t load page if its already loading', async() => {
    await Promise.all([
      hook(payload),
      hook(payload),
      hook(payload),
      hook(payload),
    ]);

    expect(dispatch).toHaveBeenCalledTimes(4);
    expect(dispatch).toHaveBeenNthCalledWith(1, actions.requestBook('book-slug-1'));
    expect(dispatch).toHaveBeenNthCalledWith(2, actions.receiveBook(expect.anything()));
    expect(dispatch).toHaveBeenNthCalledWith(3, actions.requestPage('test-page-1'));
    expect(dispatch).toHaveBeenNthCalledWith(4, actions.receivePage(expect.anything()));

    expect(archiveLoader.mock.loadPage).toHaveBeenCalledTimes(1);
  });

  it('doesn\'t break if there are no fonts in the css', () => {
    const spy = jest.spyOn(helpers.fontCollector, 'add');
    jest.resetModules();
    hook = (require('./locationChange').default)(helpers);

    hook(payload);
    expect(spy).not.toHaveBeenCalled();
  });

  it('loads more specific data when available', async() => {
    payload.match.state = {
      bookUid: 'testbook1-uuid',
      bookVersion: '1.0',
      pageUid: 'testbook1-testpage1-uuid',
    };

    await hook(payload);
    expect(archiveLoader.mock.loadBook).toHaveBeenCalledWith('testbook1-uuid', '1.0');
    expect(archiveLoader.mock.loadPage).toHaveBeenCalledWith('testbook1-uuid', '1.0', 'testbook1-testpage1-uuid');
  });

  it('loads a page with a content reference', async() => {
    archiveLoader.mockPage(book, {
      content: 'rando content',
      id: 'rando-page-id',
      shortId: 'rando-page-shortid',
      title: 'rando page',
      version: '0',
    });
    archiveLoader.mockPage(book, {
      content: 'some /contents/rando-page-id content',
      id: 'asdfasfasdfasdf',
      shortId: 'asdf',
      title: 'qwerqewrqwer',
      version: '0',
    });

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

  it('throws on unknown cross book reference', async() => {
    archiveLoader.mockPage(book, {
      content: 'some /contents/book:pagelongid content',
      id: 'adsfasdf',
      shortId: 'asdf',
      title: 'qerqwer',
      version: '0',
    });

    payload.match.params = {
      book: 'book',
      page: 'qerqwer',
    };

    let message: string | undefined;

    try {
      await hook(payload);
    } catch (e) {
      message = e.message;
    }

    expect(message).toEqual('BUG: book could not be found in any configured books.');
  });

  it('throws on reference to unknown id', async() => {
    archiveLoader.mockPage(book, {
      content: 'some /contents/qwerqwer content',
      id: 'adsfasdf',
      shortId: 'asdf',
      title: 'qerqwer',
      version: '0',
    });

    payload.match.params.page = 'qerqwer';

    let message: string | undefined;

    try {
      await hook(payload);
    } catch (e) {
      message = e.message;
    }

    expect(message).toEqual('BUG: qwerqwer could not be found in any configured books.');
  });

  it('throws on unknown id', async() => {
    payload.match.params.page = 'garbage';
    let message: string | undefined;

    try {
      await hook(payload);
    } catch (e) {
      message = e.message;
    }

    expect(message).toEqual('Page not found');
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
    localState.book = formatBookData(book, mockCmsBook);
    await hook(payload);
    expect(helpers.osWebLoader.getBookIdFromSlug).not.toHaveBeenCalled();
  });

  describe('cross book references', () => {
    const mockOtherBook = {
      id: 'newbookid',
      license: {name: '', version: ''},
      shortId: 'newbookshortid',
      title: 'newbook',
      tree: {
        contents: [],
        id: 'newbookid@0',
        shortId: 'newbookshortid@0',
        title: 'newbook',
      },
      version: '0',
    };
    const mockPageInOtherBook = {
      content: 'dope content bruh',
      id: 'newbookpageid',
      shortId: 'newbookpageshortid',
      title: 'page in a new book',
      version: '0',
    };
    const mockCmsOtherBook = {
      authors: [{value: {name: 'different author'}}],
      cnx_id: 'newbookid',
      cover_color: 'blue',
      meta: {
        slug: 'new-book',
      },
      publish_date: '2012-06-21',
    };

    beforeEach(() => {
      archiveLoader.mockBook(mockOtherBook);
      archiveLoader.mockPage(mockOtherBook, mockPageInOtherBook);
      mockConfig.BOOKS.newbookid = {defaultVersion: '0'};

      archiveLoader.mockPage(book, {
        content: 'some /contents/newbookpageid content',
        id: 'pageid',
        shortId: 'pageshortid',
        title: 'page referencing different book',
        version: '0',
      });

      payload.match.params.page = 'page referencing different book';

      payload.match.state = {
        bookUid: 'testbook1-uuid',
        bookVersion: '1.0',
        pageUid: 'pageid',
      };
    });

    it('load', async() => {
      archiveLoader.mock.getBookIdsForPage.mockReturnValue(Promise.resolve(['newbookid']));
      osWebLoader.getBookFromId.mockReturnValue(mockCmsOtherBook);

      await hook(payload);

      expect(archiveLoader.mock.getBookIdsForPage).toHaveBeenCalledWith('newbookpageid');
      expect(osWebLoader.getBookFromId).toHaveBeenCalledWith('newbookid');

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

    it('error when archive returns a book that doesn\'t actually contain the page', async() => {
      archiveLoader.mockBook({
        id: 'garbagebookid',
        license: {name: '', version: ''},
        shortId: 'garbagebookshortid',
        title: 'book without the page you\'re looking for',
        tree: {
          contents: [],
          id: 'garbagebookid@0',
          shortId: 'garbagebookshortid@0',
          title: 'garbage book',
        },
        version: '0',
      });
      archiveLoader.mock.getBookIdsForPage.mockReturnValue(Promise.resolve(['garbagebookid']));
      mockConfig.BOOKS.garbagebookid = {defaultVersion: '0'};
      osWebLoader.getBookFromId.mockReturnValue(mockCmsOtherBook);

      let message: string | undefined;

      try {
        await hook(payload);
      } catch (e) {
        message = e.message;
      }

      expect(message).toEqual('BUG: archive thought garbagebookid would contain newbookpageid, but it didn\'t');
    });
  });
});
