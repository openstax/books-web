import { SearchResultHit } from '@openstax/open-search-client/dist/models/SearchResultHit';
import { SearchResultHitSourceElementTypeEnum } from '@openstax/open-search-client/dist/models/SearchResultHitSource';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { book, page, shortPage } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { push, replace } from '../../navigation/actions';
import { AppServices, MiddlewareAPI, Store } from '../../types';
import { assertWindow } from '../../utils';
import { receiveBook, receivePage } from '../actions';
import { content } from '../routes';
import { formatBookData } from '../utils';
import { clearSearch, receiveSearchResults, requestSearch } from './actions';
import { receiveSearchHook, requestSearchHook, syncSearch } from './hooks';

describe('hooks', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: MiddlewareAPI & AppServices;

  beforeEach(() => {
    store = createTestStore();
    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };
    dispatch = jest.spyOn(helpers, 'dispatch');
  });

  describe('requestSearchHook', () => {
    let hook: ReturnType<typeof requestSearchHook>;

    beforeEach(() => {
      hook = requestSearchHook(helpers);
    });

    it('searches', async() => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      await hook(requestSearch('asdf'));
      expect(helpers.searchClient.search).toHaveBeenCalled();
    });

    it('noops when there isn\'t a book', async() => {
      await hook(requestSearch('asdf'));
      expect(helpers.searchClient.search).not.toHaveBeenCalled();
    });

    it('noops when query is empty', async() => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      await hook(requestSearch(''));
      expect(helpers.searchClient.search).not.toHaveBeenCalled();
    });

    it('dispatches receiveSearchResults', async() => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      (helpers.searchClient.search as any).mockReturnValue('searchresults');
      await hook(requestSearch('asdf'));
      expect(dispatch).toHaveBeenCalledWith(
        receiveSearchResults('searchresults' as any)
      );
    });
  });

  describe('syncSearch', () => {
    let hook: ReturnType<typeof syncSearch>;

    beforeEach(() => {
      hook = syncSearch(helpers);
    });

    it('doesn\'t dispatch for REPLACE actions', () => {
      hook({
        action: 'REPLACE',
        location: {
          ...assertWindow().location,
          state: {},
        },
        match: {} as any,
      });
      hook({
        action: 'REPLACE',
        location: {
          ...assertWindow().location,
          state: {
            search: 'asdf',
          },
        },
        match: {} as any,
      });

      expect(dispatch).not.toHaveBeenCalled();
    });

    it('doesn\'t dispatch for PUSH actions', () => {
      hook({
        action: 'PUSH',
        location: {
          ...assertWindow().location,
          state: {},
        },
        match: {} as any,
      });
      hook({
        action: 'PUSH',
        location: {
          ...assertWindow().location,
          state: {
            search: 'asdf',
          },
        },
        match: {} as any,
      });

      expect(dispatch).not.toHaveBeenCalled();
    });

    it('searches for saved query on POP if it is differet from current query', () => {
      store.dispatch(requestSearch('asdf'));

      hook({
        action: 'POP',
        location: {
          ...assertWindow().location,
          state: { search: 'qwer' },
        },
        match: {} as any,
      });

      expect(dispatch).toHaveBeenCalledWith(requestSearch('qwer'));
    });

    it('doesn\'t dispatch on POP if saved query is same as current query', () => {
      store.dispatch(requestSearch('asdf'));

      hook({
        action: 'POP',
        location: {
          ...assertWindow().location,
          state: { search: 'asdf' },
        },
        match: {} as any,
      });
      expect(dispatch).not.toHaveBeenCalled();
    });

    it('clears search on POP if saved query is empty and curren\'t query isn\'t', () => {
      store.dispatch(requestSearch('asdf'));

      hook({
        action: 'POP',
        location: {
          ...assertWindow().location,
          state: { search: '' },
        },
        match: {} as any,
      });
      expect(dispatch).toHaveBeenCalledWith(clearSearch());
    });
  });

  describe('receiveSearchHook', () => {
    let hook: ReturnType<typeof receiveSearchHook>;
    const hit: SearchResultHit = {
      highlight: { visibleContent: ['cool <em>highlight</em> bruh'] },
      index: `${book.id}@${book.version}_i1`,
      score: 2,
      source: {
        elementId: 'fs-id1544727',
        elementType: SearchResultHitSourceElementTypeEnum.Paragraph,
        pageId: `${page.id}@${page.version}`,
        pagePosition: 60,
      },
    };

    const go = (hits: SearchResultHit[] = []) =>
      hook(
        receiveSearchResults({
          hits: { hits, total: 0 },
          overallTook: 75,
          shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
          timedOut: false,
          took: 0,
        })
      );

    beforeEach(() => {
      hook = receiveSearchHook(helpers);
    });

    it('noops if there are no results', () => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({ ...page, references: [] }));
      go();
      expect(dispatch).not.toHaveBeenCalled();
    });

    it('noops if search and page match intended already', () => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({ ...page, references: [] }));
      store.dispatch(requestSearch('asdf'));
      helpers.history.replace({ state: { search: 'asdf' } });
      go([hit]);
      expect(dispatch).not.toHaveBeenCalled();
    });

    it('noops if there is no book or page selected', () => {
      go([hit]);
      expect(dispatch).not.toHaveBeenCalled();
    });

    it('noops if book is different than initiated the search', () => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({ ...page, references: [] }));
      go([
        {
          ...hit,
          index: 'asdf@4_i1',
        },
      ]);
      expect(dispatch).not.toHaveBeenCalled();
    });

    it('throws if index string is improperly formatted', () => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({ ...page, references: [] }));
      store.dispatch(requestSearch('asdf'));
      expect(() =>
        go([
          {
            ...hit,
            index: 'asdf',
          },
        ])
      ).toThrowErrorMatchingInlineSnapshot(
        `"impropertly formatted index string: \\"asdf\\""`
      );
    });

    it('dispatches PUSH with first page and search query when page is different', () => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({ ...shortPage, references: [] }));
      store.dispatch(requestSearch('asdf'));
      go([hit]);
      expect(dispatch).toHaveBeenCalledWith(
        push({
          params: expect.anything(),
          route: content,
          state: {
            bookUid: book.id,
            bookVersion: book.version,
            pageUid: page.id,
            search: 'asdf',
          },
        })
      );
    });

    it('dispatches REPLACE with search query when page is the same', () => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({ ...page, references: [] }));
      store.dispatch(requestSearch('asdf'));
      go([hit]);
      expect(dispatch).toHaveBeenCalledWith(
        replace({
          params: expect.anything(),
          route: content,
          state: {
            bookUid: book.id,
            bookVersion: book.version,
            pageUid: page.id,
            search: 'asdf',
          },
        })
      );
    });
  });
});
