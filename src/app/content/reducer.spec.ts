import omit from 'lodash/fp/omit';
import { book as archiveBook, page as archivePage } from '../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../test/mocks/osWebLoader';
import { locationChange } from '../navigation/actions';
import { AnyAction, FirstArgumentType } from '../types';
import { assertWindow } from '../utils';
import * as actions from './actions';
import reducer, { initialState } from './reducer';
import { content } from './routes';
import searchReducer from './search/reducer';
import { formatBookData } from './utils';

jest.mock('./search/reducer', () => jest.fn((state: any) => state));

const book = formatBookData(archiveBook, mockCmsBook);

describe('content reducer', () => {

  it('reduces openToc', () => {
    const state = {
      ...initialState,
      tocOpen: false,
    };
    const newState = reducer(state, actions.openToc());
    expect(newState.tocOpen).toEqual(true);
  });

  it('reduces closeToc', () => {
    const state = {
      ...initialState,
      tocOpen: true,
    };
    const newState = reducer(state, actions.closeToc());
    expect(newState.tocOpen).toEqual(false);
  });

  it('reduces resetToc', () => {
    const state = {
      ...initialState,
      tocOpen: true,
    };
    const newState = reducer(state, actions.resetToc());
    expect(newState.tocOpen).toEqual(null);
  });

  it('reduces requestBook', () => {
    const newState = reducer(initialState, actions.requestBook('bookId'));
    expect(newState.loading.book).toEqual('bookId');
  });

  it('reduces requestPage', () => {
    const newState = reducer(initialState, actions.requestPage('pageId'));
    expect(newState.loading.page).toEqual('pageId');
  });

  it('reduces receiveBook', () => {
    const state = {
      ...initialState,
      loading: {book: book.id},
    };
    const newState = reducer(state, actions.receiveBook(book));
    expect(newState.loading.book).not.toBeDefined();
    if (newState.book) {
      expect(newState.book.id).toEqual(book.id);
      expect((newState.book as any).content).not.toBeDefined();
    } else {
      expect(newState.book).toBeTruthy();
    }
  });

  it('reduces receivePage', () => {
    const page = { id: 'pageId', content: 'fooobarcontent' } as FirstArgumentType<typeof actions.receivePage>;
    const state = {
      ...initialState,
      loading: {page: 'pageId'},
    };
    const newState = reducer(state, actions.receivePage(page));
    expect(newState.loading.page).not.toBeDefined();
    if (newState.page) {
      expect(newState.page.id).toEqual('pageId');
      expect((newState.page as any).content).not.toBeDefined();
    } else {
      expect(newState.page).toBeTruthy();
    }
  });

  it('resets state when location changes to a new book', () => {
    const state = {
      ...initialState,
      params: {
        book: 'foo',
        page: 'bar',
      },
      tocOpen: true,
    };
    const newState = reducer(state, locationChange({
      action: 'PUSH',
      location: {
        ...assertWindow().location,
        state: {},
      },
      match: {
        params: {
          book: 'newbook',
          page: 'bar',
        },
        route: content,
      },
    }));
    expect(newState).toEqual({
      ...initialState,
      params: {
        book: 'newbook',
        page: 'bar',
      },
    });
  });

  it('resets page when location changes to new page', () => {
    const state = {
      ...initialState,
      book,
      page: {...archivePage, references: []},
      params: {
        book: 'foo',
        page: 'bar',
      },
      tocOpen: true,
    };
    const newState = reducer(state, locationChange({
      action: 'PUSH',
      location: {
        ...assertWindow().location,
        state: {},
      },
      match: {
        params: {
          book: 'foo',
          page: 'new page',
        },
        route: content,
      },
    }));
    expect(newState).toEqual({
      ...omit('page', state),
      params: {
        book: 'foo',
        page: 'new page',
      },
    });
  });

  it('adds params on location change', () => {
    const state = {
      ...initialState,
      params: {
        book: book.slug,
        page: 'foo',
      },
    };
    const newState = reducer(state, locationChange({
      action: 'PUSH',
      location: {
        ...assertWindow().location,
        state: {},
      },
      match: {
        params: {
          book: book.slug,
          page: 'new page',
        },
        route: content,
      },
    }));
    expect(newState).toEqual({
      ...initialState,
      params: {
        book: book.slug,
        page: 'new page',
      },
    });
  });

  it('composes searchReducer', () => {
    const action = {type: 'foo'} as unknown as AnyAction;
    const state = initialState;
    reducer(state, action);

    expect(searchReducer).toHaveBeenCalledWith(state.search, action);
  });
});
