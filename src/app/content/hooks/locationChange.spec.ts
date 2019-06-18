import { Location } from 'history';
import FontCollector from '../../../helpers/FontCollector';
import PromiseCollector from '../../../helpers/PromiseCollector';
import createTestStore from '../../../test/createTestStore';
import mockArchiveLoader, { book, page } from '../../../test/mocks/archiveLoader';
import mockOSWebLoader from '../../../test/mocks/osWebLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { Match } from '../../navigation/types';
import { AppServices, MiddlewareAPI, Store } from '../../types';
import * as actions from '../actions';
import { receiveBook, receivePage } from '../actions';
import * as routes from '../routes';
import { formatBookData } from '../utils';

describe('locationChange', () => {
  let store: Store;
  let archiveLoader: ReturnType<typeof mockArchiveLoader>;
  let dispatch: jest.SpyInstance;
  let helpers: MiddlewareAPI & AppServices;
  let payload: {location: Location, match: Match<typeof routes.content>};
  let hook = require('./locationChange').default;

  beforeEach(() => {
    store = createTestStore();

    archiveLoader = mockArchiveLoader();

    dispatch = jest.fn((action) => store.dispatch(action));

    helpers = {
      archiveLoader,
      dispatch,
      fontCollector: new FontCollector(),
      getState: store.getState,
      osWebLoader: mockOSWebLoader(),
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
    store.dispatch(receiveBook({...formatBookData(book, mockCmsBook), slug: 'book'}));
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
    store.dispatch(receivePage({...page, references: []}));

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
      content: 'some <a href="/contents/rando-page-id"></a> content',
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

  it('throws on cross book reference', async() => {
    archiveLoader.mockPage(book, {
      content: 'some <a href="/contents/book:pagelongid"></a> content',
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

    expect(message).toEqual('BUG: page "qerqwer" in book "Test Book 1" Cross book references are not supported');
  });

  it('throws on reference to unknown id', async() => {
    archiveLoader.mockPage(book, {
      content: 'some <a href="/contents/qwerqwer"></a> content',
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

    expect(message).toEqual(
      'BUG: page "qerqwer" in book "Test Book 1" referenced content "qwerqwer" not present in the ToC'
    );
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
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    await hook(payload);
    expect(helpers.osWebLoader.getBookIdFromSlug).not.toHaveBeenCalled();
  });
});
