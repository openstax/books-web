import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import { book as archiveBook, page } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { push } from '../../navigation/actions';
import { Store } from '../../types';
import { receiveBook } from '../actions';
import { content } from '../routes';
import { requestSearch } from '../search/actions';
import { formatBookData } from '../utils';
import ConnectedContentLink from './ContentLink';

const BOOK_SLUG = 'book-slug-1';
const PAGE_SLUG = 'test-page-1';

const book = formatBookData(archiveBook, mockCmsBook);

describe('ContentLink', () => {
  let consoleError: jest.SpyInstance;
  let store: Store;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error');
    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  const click = (component: renderer.ReactTestRenderer) => {
    const event = {
      preventDefault: jest.fn(),
    };

    component.root.findByType('a').props.onClick(event);

    return event;
  };

  it('dispatches navigation action on click', () => {
    const component = renderer.create(<Provider store={store}>
      <ConnectedContentLink book={book} page={page} />
    </Provider>);

    const event = click(component);

    expect(dispatch).toHaveBeenCalledWith(push({
      params: {book: BOOK_SLUG, page: PAGE_SLUG},
      route: content,
      state: { bookUid: 'testbook1-uuid', bookVersion: '1.0', pageUid: 'testbook1-testpage1-uuid' },
    }));
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('dispatches navigation action with search if there is a search', () => {
    store.dispatch(requestSearch('asdf'));
    store.dispatch(receiveBook(book));
    const component = renderer.create(<Provider store={store}>
      <ConnectedContentLink book={book} page={page} />
    </Provider>);

    const event = click(component);

    expect(dispatch).toHaveBeenCalledWith(push({
      params: {book: BOOK_SLUG, page: PAGE_SLUG},
      route: content,
      state: {
        bookUid: 'testbook1-uuid',
        bookVersion: '1.0',
        pageUid: 'testbook1-testpage1-uuid',
        search: expect.objectContaining({query: 'asdf'}),
      },
    }));
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('dispatches navigation action without search when linking to a different book', () => {
    store.dispatch(requestSearch('asdf'));
    store.dispatch(receiveBook({...book, id: 'differentid'}));
    const component = renderer.create(<Provider store={store}>
      <ConnectedContentLink book={book} page={page} />
    </Provider>);

    const event = click(component);

    expect(dispatch).toHaveBeenCalledWith(push({
      params: {book: BOOK_SLUG, page: PAGE_SLUG},
      route: content,
      state: { bookUid: 'testbook1-uuid', bookVersion: '1.0', pageUid: 'testbook1-testpage1-uuid' },
    }));
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('calls onClick when passed', () => {
    const clickSpy = jest.fn();
    const component = renderer.create(<Provider store={store}>
      <ConnectedContentLink book={book} page={page} onClick={clickSpy} />
    </Provider>);

    const event = click(component);

    expect(dispatch).toHaveBeenCalledWith(push({
      params: {book: BOOK_SLUG, page: PAGE_SLUG},
      route: content,
      state: { bookUid: 'testbook1-uuid', bookVersion: '1.0', pageUid: 'testbook1-testpage1-uuid' },
    }));
    expect(event.preventDefault).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
  });

  it('does not call onClick or dispatch the event when the meta key is pressed', () => {
    const clickSpy = jest.fn();
    const component = renderer.create(<Provider store={store}>
      <ConnectedContentLink book={book} page={page} onClick={clickSpy} />
    </Provider>);

    const event = {
      metaKey: true,
      preventDefault: jest.fn(),
    };

    component.root.findByType('a').props.onClick(event);

    expect(dispatch).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(clickSpy).not.toHaveBeenCalled();
  });
});
