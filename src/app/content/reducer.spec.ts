import { AnyAction, FirstArgumentType } from '../types';
import * as actions from './actions';
import reducer, { initialState } from './reducer';
import searchReducer from './search/reducer';
import { Book } from './types';

jest.mock('./search/reducer');

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
    const book = { id: 'bookId', content: 'fooobarcontent' } as any as Book;
    const state = {
      ...initialState,
      loading: {book: 'bookId'},
    };
    const newState = reducer(state, actions.receiveBook(book));
    expect(newState.loading.book).not.toBeDefined();
    if (newState.book) {
      expect(newState.book.id).toEqual('bookId');
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

  it('composes searchReducer', () => {
    const action = {type: 'foo'} as unknown as AnyAction;
    const state = initialState;
    reducer(state, action);

    expect(searchReducer).toHaveBeenCalledWith(state.search, action);
  });
});
