import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book, page } from '../../../../test/mocks/archiveLoader';
import { resetModules } from '../../../../test/utils';
import { Match } from '../../../navigation/types';
import { MiddlewareAPI, Store } from '../../../types';
import * as routes from '../../routes';
import { Params, SlugParams } from '../../types';
import * as resolveContentUtils from './resolveContent';

const testUUID = '13ac107a-f15f-49d2-97e8-60ab2e3abcde';
const testVersion = '1.0';
const testPage = 'test-page-1';

jest.mock('../../../../config', () => ({
  APP_ENV: 'production',
  UNLIMITED_CONTENT: false,
}));
jest.mock('../../../../config.books', () => {
  const mockBook = (jest as any).requireActual('../../../../test/mocks/archiveLoader').book;
  return {
    [mockBook.id]: { defaultVersion: mockBook.version },
    '13ac107a-f15f-49d2-97e8-60ab2e3abcde': { defaultVersion: '1.0' },
  };
});

describe('locationChange', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let match: Match<typeof routes.content>;
  let hook: typeof import ('./resolveContent').default;
  let resolveExternalBookReference: typeof import ('./resolveContent').resolveExternalBookReference;

  const mockUUIDBook = () => {
    const uuidBook = {
      ...book,
      id: testUUID,
      version: '1.0',
    };
    helpers.archiveLoader.mockBook(uuidBook);
    helpers.archiveLoader.mockPage(uuidBook, page, testPage);
  };

  const mockOtherBook = {
    abstract: '',
    id: '13ac107a-f15f-49d2-97e8-60ab2e3other',
    language: 'en',
    license: {name: '', version: '', url: ''},
    revised: '2012-06-21',
    title: 'newbook',
    tree: {
      contents: [],
      id: '13ac107a-f15f-49d2-97e8-60ab2e3other@0',
      slug: 'newbook',
      title: 'newbook',
    },
    version: '0',
  };
  const mockPageInOtherBook = {
    abstract: '',
    content: 'dope content bruh',
    id: '99d38770-49c7-49d3-b567-88f393ffb4fe',
    revised: '2018-07-30T15:58:45Z',
    slug: 'page-in-a-new-book',
    title: 'page in a new book',
  };

  beforeEach(() => {
    resetModules();
    store = createTestStore();
    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    match = {
      params: {
        book: {
          slug: 'book-slug-1',
        },
        page : {
          slug: testPage,
        },
      },
      route: routes.content,
      state: {},
    };

    const resolveContent = require('./resolveContent');
    hook = resolveContent.default;
    resolveExternalBookReference = resolveContent.resolveExternalBookReference;
  });

  describe('in production', () => {
    it('throws if book is missing cms data in production', async() => {
      helpers.osWebLoader.getBookSlugFromId.mockImplementation(() => Promise.resolve(undefined) as any);
      mockUUIDBook();

      const versionedUuidParams = {
        book: {
          uuid: testUUID,
          version: testVersion,
        },
        page: {
          slug: (match.params.page as SlugParams).slug,
        },
      } as Params;
      match.params = versionedUuidParams;

      await expect(hook(helpers, match))
        .rejects.toThrow('books without cms data are only supported outside production');
    });

    it('resolveExternalBookReference throws if book wasnt found', async() => {
      helpers.archiveLoader.mock.loadBook.mockRejectedValue(new Error('asda'));

      match.params = {
        book: {uuid: book.id, version: '1.0'},
        page: {slug: 'asd'},
      };

      const reference = {
        bookId: book.id,
        bookVersion: '1.0',
        match: 'ajhd',
        pageId: 'asd',
      };

      await expect(resolveExternalBookReference(helpers, mockOtherBook, mockPageInOtherBook, reference))
        .rejects.toThrow('asda');
    });

    it('getBookInformation throws if reference doesn\'t specify bookVersion', async() => {
      const reference = {
        bookId: 'asd',
        bookVersion: undefined,
        match: 'ajhd',
        pageId: 'asd',
      };

      await expect(resolveContentUtils.getBookInformation(helpers, reference))
        .rejects.toThrow(`book version wasn't specified for book ${reference.bookId}`);
    });
  });
});
