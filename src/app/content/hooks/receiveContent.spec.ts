import cloneDeep from 'lodash/fp/cloneDeep';
import { book as archiveBook, page } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { ActionHookBody, AppServices, AppState, MiddlewareAPI } from '../../types';
import { receiveBook, receivePage } from '../actions';
import { initialState } from '../reducer';
import { Book, Page, State } from '../types';
import { formatBookData } from '../utils';

const book = formatBookData(archiveBook, mockCmsBook);

describe('setHead hook', () => {
  let hookBody: ActionHookBody<typeof receiveBook | typeof receivePage>;
  let mockSetHead: jest.SpyInstance;
  let localState: State;
  const helpers = {} as MiddlewareAPI & AppServices;

  beforeEach(() => {
    mockSetHead = jest.fn();

    localState = cloneDeep(initialState);

    helpers.dispatch = jest.fn();
    helpers.getState = () => ({content: localState} as AppState);

    jest.mock('../../head/actions', () => ({
      setHead: mockSetHead,
    }));

    hookBody = require('./receiveContent').default;
  });

  it('dispatches setHead when receiveBook is dispatched', () => {
    const head = {some: 'data'};
    mockSetHead.mockImplementation(() => head);

    localState.book = book;
    localState.page = page;

    hookBody(helpers)(receiveBook(book));

    expect(helpers.dispatch).toHaveBeenCalledWith(head);
  });

  it('dispatches setHead when receivePage is dispatched', () => {
    const head = {some: 'data'};
    mockSetHead.mockImplementation(() => head);

    localState.book = book;
    localState.page = page;

    hookBody(helpers)(receivePage({...page, references: []}));

    expect(helpers.dispatch).toHaveBeenCalledWith(head);
  });

  it('does nothing if book is loading', () => {
    localState.book = { title: 'book', id: 'book' } as Book;
    localState.page = { title: 'page', id: 'page' } as Page;
    localState.loading.book = 'book2';

    hookBody(helpers)(receiveBook(book));

    expect(helpers.dispatch).not.toHaveBeenCalled();
  });

  it('does nothing if page is loading', () => {
    localState.book = { title: 'book', id: 'book' } as Book;
    localState.page = { title: 'page', id: 'page' } as Page;
    localState.loading.page = 'page2';

    hookBody(helpers)(receiveBook({} as Book));

    expect(helpers.dispatch).not.toHaveBeenCalled();
  });

  it('does nothing if page is not loaded', () => {
    localState.book = { title: 'book', id: 'book' } as Book;

    hookBody(helpers)(receiveBook(book));

    expect(helpers.dispatch).not.toHaveBeenCalled();
  });

  it('does nothing if book is not loaded', () => {
    localState.page = { title: 'page', id: 'page' } as Page;

    hookBody(helpers)(receiveBook(book));

    expect(helpers.dispatch).not.toHaveBeenCalled();
  });
});
