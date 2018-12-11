import { Document } from '@openstax/types/lib.dom';
import cloneDeep from 'lodash/fp/cloneDeep';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { combineReducers, createStore } from 'redux';
import mockArchiveLoader, {
  book,
  page
} from '../../../test/mocks/archiveLoader';
import { renderToDom } from '../../../test/reactutils';
import * as Services from '../../context/Services';
import { push } from '../../navigation/actions';
import { AppServices, AppState, MiddlewareAPI, Store } from '../../types';
import reducer, { initialState } from '../reducer';
import * as routes from '../routes';
import ConnectedPage from './Page';

describe('Page', () => {
  let archiveLoader: ReturnType<typeof mockArchiveLoader>;
  let state: AppState;
  let store: Store;
  let dispatch: jest.SpyInstance;
  const services = {} as AppServices & MiddlewareAPI;

  beforeEach(() => {
    state = (cloneDeep({
      content: {
        ...initialState,
        book,
        page,
      },
    }) as any) as AppState;

    store = createStore(combineReducers({ content: reducer }), state);

    dispatch = jest.spyOn(store, 'dispatch');

    archiveLoader = mockArchiveLoader();
    (services as any).archiveLoader = archiveLoader;

    archiveLoader.mock.cachedPage.mockImplementation(() => ({
      ...page,
      content: `
        some text
        <a href="/content/link">some link</a>
        some more text
        <a href="/rando/link">another link</a>
        text
        <button>asdf</button>
      `,
    }));

    state.content.references = [
      {
        match: '/content/link',
        params: {
          bookId: 'book',
          pageId: 'page',
        },
        state: {
          bookUid: 'book',
          bookVersion: 'version',
          pageUid: 'page',
        },
      },
    ];

  });

  it('updates content link with new hrefs', () => {
    const { node } = renderToDom(
      <Provider store={store}>
        <Services.Provider value={services}>
          <ConnectedPage />
        </Services.Provider>
      </Provider>
    );

    const [firstLink, secondLink] = Array.from(node.querySelectorAll('[data-type="page"] a'));

    if (!firstLink || !secondLink) {
      expect(firstLink).toBeTruthy();
      expect(secondLink).toBeTruthy();
    }

    expect(firstLink.getAttribute('href')).toEqual('/books/book/pages/page');
    expect(secondLink.getAttribute('href')).toEqual('/rando/link');
  });

  it('interceptes clicking content links', () => {
    const { node } = renderToDom(
      <Provider store={store}>
        <Services.Provider value={services}>
          <ConnectedPage />
        </Services.Provider>
      </Provider>
    );

    const [firstLink, secondLink] = Array.from(node.querySelectorAll('[data-type="page"] a'));
    const button = node.querySelector('[data-type="page"] button');

    if (!document || !firstLink || !secondLink || !button) {
      expect(document).toBeTruthy();
      expect(firstLink).toBeTruthy();
      expect(secondLink).toBeTruthy();
      expect(button).toBeTruthy();
      return;
    }

    const makeEvent = (doc: Document) => {
      const event = doc.createEvent('MouseEvents');
      event.initEvent('click', true, false);
      event.preventDefault();
      event.preventDefault = jest.fn();
      return event;
    };

    const evt1 = makeEvent(document);
    const evt2 = makeEvent(document);
    const evt3 = makeEvent(document);

    firstLink.dispatchEvent(evt1);
    secondLink.dispatchEvent(evt2);
    button.dispatchEvent(evt3);

    expect(evt1.preventDefault).toHaveBeenCalled();
    expect(evt2.preventDefault).not.toHaveBeenCalled();
    expect(evt3.preventDefault).not.toHaveBeenCalled();

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(push({
      params: {
        bookId: 'book',
        pageId: 'page',
      },
      route: routes.content,
      state: {
        bookUid: 'book',
        bookVersion: 'version',
        pageUid: 'page',
      },
    }));
  });

  it('removes listener when it unmounts', () => {
    const { root, node } = renderToDom(
      <Provider store={store}>
        <Services.Provider value={services}>
          <ConnectedPage />
        </Services.Provider>
      </Provider>
    );

    const pageElement = node.querySelector('[data-type="page"]');

    if (!pageElement) {
      return expect(pageElement).toBeTruthy();
    }

    const removeEventListener = jest.spyOn(pageElement, 'removeEventListener');

    ReactDOM.unmountComponentAtNode(root);

    expect(removeEventListener).toHaveBeenCalled();
  });

  it('mounts and unmounts wihtout a dom', () => {
    const element = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <ConnectedPage />
        </Services.Provider>
      </Provider>
    );

    expect(element.unmount).not.toThrow();
  });
});
