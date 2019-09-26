import { SearchResultHit } from '@openstax/open-search-client/dist/models/SearchResultHit';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { book, page, shortPage } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { makeSearchResultHit, makeSearchResults } from '../../../test/searchResults';
import { push, replace } from '../../navigation/actions';
import { AppServices, ArgumentTypes, MiddlewareAPI, Store } from '../../types';
import { assertWindow } from '../../utils';
import { receiveBook, receivePage } from '../actions';
import { content } from '../routes';
import { formatBookData } from '../utils';
import { clearSearch, receiveSearchResults, requestSearch, selectSearchResult } from './actions';
import { clearSearchHook, receiveSearchHook, requestSearchHook, syncSearch } from './hooks';

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

  describe('clearSearchHook', () => {
    let hook: ReturnType<typeof clearSearchHook>;

    beforeEach(() => {
      hook = clearSearchHook(helpers);
    });

    it('clears search state', () => {
      helpers.history.replace({
        state: {
          search: {query: 'foo'},
        },
      });

      hook(clearSearch());

      expect(helpers.history.location.state.search).toBe(null);
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
          state: { search: {query: 'qwer'} },
        },
        match: {} as any,
      });

      expect(dispatch).toHaveBeenCalledWith(requestSearch('qwer'));
    });

    it('searches for saved query with selectedResult on POP if it is differet from current query', () => {
      store.dispatch(requestSearch('asdf'));

      const hit = makeSearchResultHit({book, page});
      const selectedResult = {result: hit, highlight: 0};
      hook({
        action: 'POP',
        location: {
          ...assertWindow().location,
          state: { search: {query: 'qwer', selectedResult}},
        },
        match: {} as any,
      });

      expect(dispatch).toHaveBeenCalledWith(requestSearch('qwer', {isResultReload: true, selectedResult}));
    });

    it('dispatches selectSearchResult if query and page are the same', () => {
      store.dispatch(requestSearch('asdf'));

      const hit = makeSearchResultHit({book, page});
      const selectedResult = {result: hit, highlight: 0};
      hook({
        action: 'POP',
        location: {
          ...assertWindow().location,
          state: { search: {query: 'asdf', selectedResult}},
        },
        match: {} as any,
      });

      expect(dispatch).toHaveBeenCalledWith(selectSearchResult(selectedResult));
    });

    it('doesn\'t dispatch on POP if saved query is same as current query', () => {
      store.dispatch(requestSearch('asdf'));

      hook({
        action: 'POP',
        location: {
          ...assertWindow().location,
          state: { search: {query: 'asdf'} },
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
          state: { search: {query: ''} },
        },
        match: {} as any,
      });
      expect(dispatch).toHaveBeenCalledWith(clearSearch());
    });
  });

  describe('receiveSearchHook', () => {
    let hook: ReturnType<typeof receiveSearchHook>;
    const hit = makeSearchResultHit({book, page});

    const go = (hits: SearchResultHit[] = [], meta?: ArgumentTypes<typeof receiveSearchResults>[1]) =>
      hook(receiveSearchResults(makeSearchResults(hits), meta));

    beforeEach(() => {
      hook = receiveSearchHook(helpers);
    });

    it('noops if there are no results', () => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({ ...page, references: [] }));
      go();
      expect(dispatch).not.toHaveBeenCalled();
    });

    it('noops if search, page, and selected search match intended already', () => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({ ...page, references: [] }));
      store.dispatch(requestSearch('asdf'));
      store.dispatch(selectSearchResult({result: hit, highlight: 0}));
      helpers.history.replace({ state: { search: {query: 'asdf'} } });
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
            search: expect.objectContaining({query: 'asdf'}),
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
            search: expect.objectContaining({query: 'asdf'}),
          },
        })
      );
    });

    it('uses the provided selectedResult', () => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({ ...page, references: [] }));
      store.dispatch(requestSearch('asdf'));
      const selectedResult = {result: hit, highlight: 0};
      go([hit], {selectedResult});
      expect(dispatch).toHaveBeenCalledWith(
        replace({
          params: expect.anything(),
          route: content,
          state: {
            bookUid: book.id,
            bookVersion: book.version,
            pageUid: page.id,
            search: expect.objectContaining({selectedResult}),
          },
        })
      );
    });
  });
});
