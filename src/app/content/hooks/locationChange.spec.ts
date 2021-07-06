import { Location } from 'history';
import { OSWebBook } from '../../../gateways/createOSWebLoader';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { book, page } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { resetModules } from '../../../test/utils';
import { Match } from '../../navigation/types';
import { MiddlewareAPI, Store } from '../../types';
import * as actions from '../actions';
import { receiveBook, receivePage } from '../actions';
import * as routes from '../routes';
import { SlugParams } from '../types';
import { formatBookData } from '../utils';

const mockBook = {...book, id: '13ac107a-f15f-49d2-97e8-60ab2e3b519c', version: '29.7'};

const mockBookConfig = {
 [book.id]: {defaultVersion: book.version},
 [mockBook.id]: {defaultVersion: mockBook.version},
} as {[key: string]: {defaultVersion: string}};

jest.doMock('../../../config.books', () => mockBookConfig);

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
          book: {
            slug: 'book-slug-1',
          },
          page: {
            slug: 'test-page-1',
          },
        },
        route: routes.content,
        state: {},
      },
    };

    hook = (require('./locationChange').default)(helpers);
  });

  it('loads book', async() => {
    await hook(payload);
    expect(dispatch).toHaveBeenCalledWith(actions.requestBook({slug: 'book-slug-1'}));
    expect(helpers.archiveLoader.mock.loadBook).toHaveBeenCalledWith('testbook1-uuid', '1.0');
  });

  it('doesn\'t load book if its already loaded', async() => {
    store.dispatch(receiveBook(formatBookData(book, {...mockCmsBook, meta: {slug: 'book'}})));
    await hook(payload);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestBook({slug: 'book'}));
    expect(helpers.archiveLoader.mock.loadBook).not.toHaveBeenCalled();
  });

  it('loads page', async() => {
    await hook(payload);
    expect(dispatch).toHaveBeenCalledWith(actions.requestPage({slug: 'test-page-1'}));
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
    helpers.archiveLoader.mockBook(mockBook);
    helpers.archiveLoader.mockPage(mockBook, {
      abstract: '',
      // tslint:disable-next-line: max-line-length
      content: `some <a href="./${mockBook.id}@${mockBook.version}:99d38770-49c7-49d3-b567-88f393ffb4fe.xhtml"></a> content`,
      id: '99d38770-49c7-49d3-b567-88f393ffb4fe',
      revised: '2018-07-30T15:58:45Z',
      slug: 'mock-slug',
      title: 'qwerqewrqwer',
    }, 'rando-page');

    (payload.match.params.page as SlugParams).slug = 'rando-page';

    payload.match.state = {
      bookUid: mockBook.id,
      bookVersion: mockBook.version,
      pageUid: '99d38770-49c7-49d3-b567-88f393ffb4fe',
    };

    await hook(payload);

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({payload: expect.objectContaining({references: [{
      match: `./${mockBook.id}@${mockBook.version}:99d38770-49c7-49d3-b567-88f393ffb4fe.xhtml`,
      params: {
        book: {
          slug: 'book-slug-1',
        },
        page: {
          slug: 'rando-page',
        },
      },
      state: {
        bookUid: mockBook.id,
        bookVersion: mockBook.version,
        pageUid: '99d38770-49c7-49d3-b567-88f393ffb4fe',
      },
    }]})}));
  });

  it('disptaches receivePageNotFoundId for unknown id', async() => {
    (payload.match.params.page as SlugParams).slug = 'garbage';

    await hook(payload);

    expect(dispatch).toHaveBeenCalledWith(actions.receivePageNotFoundId('garbage'));
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
      id: '99d38770-49c7-49d3-b567-88f393fother',
      revised: '2018-07-30T15:58:45Z',
      slug: 'page-in-a-new-book',
      title: 'page in a new book',
    };
    const mockCmsOtherBook: OSWebBook = {
      amazon_link: '',
      authors: [{value: {name: 'different author', senior_author: true}}],
      book_state: 'live',
      cnx_id: mockOtherBook.id,
      cover_color: 'blue',
      meta: {
        slug: 'new-book',
      },
      promote_image: null,
      publish_date: '2012-06-21',
    };

    mockBookConfig[mockOtherBook.id] = {defaultVersion: mockOtherBook.version};
    jest.doMock('../../../config.books', () => mockBookConfig);

    beforeEach(() => {
      helpers.archiveLoader.mockBook(mockBook);
      helpers.archiveLoader.mockBook(mockOtherBook);
      helpers.archiveLoader.mockPage(mockOtherBook, mockPageInOtherBook, 'page-in-a-new-book');

      helpers.archiveLoader.mockPage(mockBook, {
        abstract: '',
        // tslint:disable-next-line: max-line-length
        content: `some <a href="./${mockOtherBook.id}@${mockOtherBook.version}:${mockPageInOtherBook.id}.xhtml"></a> content`,
        id: 'pageid',
        revised: '2018-07-30T15:58:45Z',
        slug: 'mock-slug',
        title: 'page referencing different book',
      }, 'page-referencing-different-book');

      (payload.match.params.page as SlugParams).slug = 'page referencing different book';

      payload.match.state = {
        bookUid: mockBook.id,
        bookVersion: mockBook.version,
        pageUid: 'pageid',
      };
    });

    it('load', async() => {
      helpers.osWebLoader.getBookFromId.mockReturnValue(Promise.resolve(mockCmsOtherBook));

      await hook(payload);

      expect(helpers.osWebLoader.getBookFromId).toHaveBeenCalledWith(mockOtherBook.id);

      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({payload: expect.objectContaining({references: [{
        match: `./${mockOtherBook.id}@${mockOtherBook.version}:${mockPageInOtherBook.id}.xhtml`,
        params: {
          book: {
            slug: 'new-book',
          },
          page: {
            slug: 'page-in-a-new-book',
          },
        },
        state: {
          bookUid: mockOtherBook.id,
          bookVersion: mockOtherBook.version,
          pageUid: mockPageInOtherBook.id,
        },
      }]})}));
    });

    it('error when archive returend book without valid tree', async() => {
      helpers.osWebLoader.getBookFromId.mockReturnValue(Promise.resolve(mockCmsOtherBook));
      const garbageBook = { ...mockOtherBook, id: '13ac107a-f15f-49d2-97e8-garbageother', tree: null } as any;
      helpers.archiveLoader.mockBook(garbageBook);
      helpers.archiveLoader.mock.loadPage.mockResolvedValue({
        abstract: '',
        // tslint:disable-next-line: max-line-length
        content: `some <a href="./${garbageBook.id}@${garbageBook.version}:thisiddoes-not7-exis-t567-88f393fother.xhtml"></a> content`,
        id: 'pageid',
        revised: '2018-07-30T15:58:45Z',
        slug: 'mock-slug',
        title: 'this page has cross link that directs to missing page',
      });

      let message: string | undefined;

      try {
        await hook(payload);
      } catch (e) {
        message = e.message;
      }

      expect(message).toEqual(
        'BUG: "Test Book 1 / this page has cross link that directs to missing page"'
        + ' referenced "thisiddoes-not7-exis-t567-88f393fother"'
        + ', but it could not be found in any configured books.'
      );
    });

    it('error when archive returns a book that doesn\'t actually contain the page', async() => {
      helpers.osWebLoader.getBookFromId.mockReturnValue(Promise.resolve(mockCmsOtherBook));
      helpers.archiveLoader.mock.loadPage.mockResolvedValue({
        abstract: '',
        // tslint:disable-next-line: max-line-length
        content: `some <a href="./${mockOtherBook.id}@${mockOtherBook.version}:thisiddoes-not7-exis-t567-88f393fother.xhtml"></a> content`,
        id: 'pageid',
        revised: '2018-07-30T15:58:45Z',
        slug: 'mock-slug',
        title: 'this page has cross link that directs to missing page',
      });

      let message: string | undefined;

      try {
        await hook(payload);
      } catch (e) {
        message = e.message;
      }

      expect(message).toEqual(
        'BUG: "Test Book 1 / this page has cross link that directs to missing page" referenced '
        + '"thisiddoes-not7-exis-t567-88f393fother"'
        + `, archive thought it would be in "${mockOtherBook.id}", but it wasn't`
      );
    });
  });
});
