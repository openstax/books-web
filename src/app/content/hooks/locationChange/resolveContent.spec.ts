import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book, page } from '../../../../test/mocks/archiveLoader';
import { resetModules } from '../../../../test/utils';
import { Match } from '../../../navigation/types';
import { MiddlewareAPI, Store } from '../../../types';
import * as actions from '../../actions';
import * as routes from '../../routes';
import { Params } from '../../types';

const mockConfig = {BOOKS: {
 [book.id]: {defaultVersion: book.version},
} as {[key: string]: {defaultVersion: string}}};

jest.doMock('../../../../config', () => mockConfig);

describe('locationChange', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let match: Match<typeof routes.content>;
  let hook: typeof import ('./resolveContent').default;

  beforeEach(() => {
    resetModules();
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    match = {
      params: {
        book: 'book-slug-1',
        page: 'test-page-1',
      },
      route: routes.content,
    };

    hook = require('./resolveContent').default;
  });

  it('doesn\'t load book if its already loading', async() => {
    helpers.archiveLoader.mock.loadBook.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(book), 100))
    );

    await Promise.all([
      hook(helpers, match),
      hook(helpers, match),
      hook(helpers, match),
    ]);

    expect(dispatch).toHaveBeenCalledTimes(4);
    expect(dispatch).toHaveBeenNthCalledWith(1, actions.requestBook({book: 'book-slug-1'}));
    expect(dispatch).toHaveBeenNthCalledWith(2, actions.receiveBook(expect.anything()));
    expect(dispatch).toHaveBeenNthCalledWith(3, actions.requestPage('test-page-1'));
    expect(dispatch).toHaveBeenNthCalledWith(4, actions.receivePage(expect.anything()));
  });

  it('doesn\'t load page if its already loading', async() => {
    await Promise.all([
      hook(helpers, match),
      hook(helpers, match),
      hook(helpers, match),
      hook(helpers, match),
    ]);

    expect(dispatch).toHaveBeenCalledTimes(4);
    expect(dispatch).toHaveBeenNthCalledWith(1, actions.requestBook({book: 'book-slug-1'}));
    expect(dispatch).toHaveBeenNthCalledWith(2, actions.receiveBook(expect.anything()));
    expect(dispatch).toHaveBeenNthCalledWith(3, actions.requestPage('test-page-1'));
    expect(dispatch).toHaveBeenNthCalledWith(4, actions.receivePage(expect.anything()));

    expect(helpers.archiveLoader.mock.loadPage).toHaveBeenCalledTimes(1);
  });

  it('uses param version if there is one', async() => {
    const versionedSlugParams = {
      ...match.params,
      version: 'asdf',
    } as Params;

    match.params = versionedSlugParams;

    helpers.archiveLoader.mockBook({
      ...book,
      version: 'asdf',
    });
    helpers.archiveLoader.mockPage({
      ...book,
      version: 'asdf',
    }, page, 'test-page-1');
    await hook(helpers, match);
    expect(helpers.archiveLoader.mock.loadBook).toHaveBeenCalledWith('testbook1-uuid', 'asdf');
  });

  it('uses latest version if requested', async() => {
    const versionedSlugParams = {
      ...match.params,
      version: 'latest',
    } as Params;

    match.params = versionedSlugParams;
    helpers.archiveLoader.mockBook({
      ...book,
      version: undefined as any as string,
    });
    helpers.archiveLoader.mockPage({
      ...book,
      version: undefined as any as string,
    }, page, 'test-page-1');
    await hook(helpers, match);
    expect(helpers.archiveLoader.mock.loadBook).toHaveBeenCalledWith('testbook1-uuid', undefined);
  });

  it('uses uuid if present', async() => {
    const versionedSlugParams = {
      page: match.params.page,
      uuid: 'longidin-vali-dfor-mat1-111111111111',
      version: '1.0',
    } as Params;

    match.params = versionedSlugParams;
    helpers.archiveLoader.mockBook({
      ...book,
      version: undefined as any as string,
    });
    helpers.archiveLoader.mockPage({
      ...book,
      version: undefined as any as string,
    }, page, 'test-page-1');
    await hook(helpers, match);
    expect(helpers.archiveLoader.mock.loadBook).toHaveBeenCalledWith('longidin-vali-dfor-mat1-111111111111', '1.0');
  });

});
