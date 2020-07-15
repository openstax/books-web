import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import { book as archiveBook, page } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { push } from '../../navigation/actions';
import { Store } from '../../types';
import { receiveBook } from '../actions';
import { setAnnotationChangesPending } from '../highlights/actions';
import { content } from '../routes';
import { requestSearch } from '../search/actions';
import { formatBookData } from '../utils';

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

  const click = async(component: renderer.ReactTestRenderer) => {
    const event = {
      preventDefault: jest.fn(),
    };

    await component.root.findByType('a').props.onClick(event);

    return event;
  };

  describe('without unsaved changes', () => {
    // tslint:disable-next-line:variable-name
    let ConnectedContentLink: React.ElementType;

    beforeEach(() => {
      ConnectedContentLink = require('./ContentLink').default;
    });

    it('dispatches navigation action on click', async() => {
      const component = renderer.create(<Provider store={store}>
        <ConnectedContentLink book={book} page={page} />
      </Provider>);

      const event = await click(component);

      expect(dispatch).toHaveBeenCalledWith(push({
        params: {book: {slug: BOOK_SLUG}, page: {slug: PAGE_SLUG}},
        route: content,
        state: { bookUid: 'testbook1-uuid', bookVersion: '1.0', pageUid: 'testbook1-testpage1-uuid' },
      }));
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('dispatches navigation action with search if there is a search', async() => {
      store.dispatch(requestSearch('asdf'));
      store.dispatch(receiveBook(book));
      const component = renderer.create(<Provider store={store}>
        <ConnectedContentLink book={book} page={page} />
      </Provider>);

      const event = await click(component);

      expect(dispatch).toHaveBeenCalledWith(push({
        params: {book: {slug: BOOK_SLUG}, page: {slug: PAGE_SLUG}},
        route: content,
        state: {
          bookUid: 'testbook1-uuid',
          bookVersion: '1.0',
          pageUid: 'testbook1-testpage1-uuid',
        },
      }, { search: 'query=asdf' }));
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('dispatches navigation action without search when linking to a different book', async() => {
      store.dispatch(requestSearch('asdf'));
      store.dispatch(receiveBook({...book, id: 'differentid'}));
      const component = renderer.create(<Provider store={store}>
        <ConnectedContentLink book={book} page={page} />
      </Provider>);

      const event = await click(component);

      expect(dispatch).toHaveBeenCalledWith(push({
        params: {book: {slug: BOOK_SLUG}, page: {slug: PAGE_SLUG}},
        route: content,
        state: { bookUid: 'testbook1-uuid', bookVersion: '1.0', pageUid: 'testbook1-testpage1-uuid' },
      }));
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('calls onClick when passed', async() => {
      const clickSpy = jest.fn();
      const component = renderer.create(<Provider store={store}>
        <ConnectedContentLink book={book} page={page} onClick={clickSpy} />
      </Provider>);

      const event = await click(component);

      expect(dispatch).toHaveBeenCalledWith(push({
        params: {book: {slug: BOOK_SLUG}, page: {slug: PAGE_SLUG}},
        route: content,
        state: { bookUid: 'testbook1-uuid', bookVersion: '1.0', pageUid: 'testbook1-testpage1-uuid' },
      }));
      expect(event.preventDefault).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
    });

    it('does not call onClick or dispatch the event when the meta key is pressed', async() => {
      const clickSpy = jest.fn();
      const component = renderer.create(<Provider store={store}>
        <ConnectedContentLink book={book} page={page} onClick={clickSpy} />
      </Provider>);

      const event = {
        metaKey: true,
        preventDefault: jest.fn(),
      };

      await component.root.findByType('a').props.onClick(event);

      expect(dispatch).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(clickSpy).not.toHaveBeenCalled();
    });
  });

  describe('with unsaved changes' , () => {
    // tslint:disable-next-line:variable-name
    let ConnectedContentLink: React.ElementType;
    const mockConfirmation = jest.fn()
      .mockImplementationOnce(() => new Promise((resolve) => setTimeout(() => resolve(false), 300)))
      .mockImplementationOnce(() => new Promise((resolve) => setTimeout(() => resolve(true), 300)));

    jest.mock(
      '../highlights/components/utils/showConfirmation',
      () => mockConfirmation
    );

    beforeEach(() => {
      ConnectedContentLink = require('./ContentLink').default;
    });

    it('does not call onClick or dispatch if user decides not to discard changes' , async() => {
      const clickSpy = jest.fn();
      store.dispatch(setAnnotationChangesPending(true));
      const component = renderer.create(<Provider store={store}>
        <ConnectedContentLink book={book} page={page} onClick={clickSpy} />
      </Provider>);

      const event = await click(component);

      expect(dispatch).not.toHaveBeenCalledWith(push(expect.anything()));
      expect(event.preventDefault).toHaveBeenCalled();
      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('calls onClick and dispatch if user decides to discard changes' , async() => {
      const clickSpy = jest.fn();
      store.dispatch(setAnnotationChangesPending(true));
      const component = renderer.create(<Provider store={store}>
        <ConnectedContentLink book={book} page={page} onClick={clickSpy} />
      </Provider>);

      const event = await click(component);

      expect(dispatch).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
    });
  });
});
