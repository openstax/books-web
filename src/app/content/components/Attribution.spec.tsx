import cloneDeep from 'lodash/fp/cloneDeep';
import createTestStore from '../../../test/createTestStore';
import { book, page, shortPage } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import MessageProvider from '../../MessageProvider';
import { AppState, Store } from '../../types';
import * as actions from '../actions';
import { initialState } from '../reducer';
import { formatBookData } from '../utils';
let React: any; // tslint:disable-line:variable-name
let ReactDOM: any; // tslint:disable-line:variable-name
let renderer: any;
let Provider: any; // tslint:disable-line:variable-name
let renderToDom: any;

describe('Attribution', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
    React = require('react');
    ReactDOM = require('react-dom');
    Provider = require('react-redux').Provider;
    renderer = require('react-test-renderer');
    renderToDom = require('../../../test/reactutils').renderToDom;
  });

  describe('in browser', () => {
    // tslint:disable-next-line:variable-name
    let Attribution: any;
    let state: AppState;
    let store: Store;
    let scrollTo: any;

    beforeEach(() => {
      const mockScrollTo = scrollTo = jest.fn();
      jest.mock('scroll-to-element', () => mockScrollTo);
      Attribution = require('./Attribution').default;

      state = (cloneDeep({
        content: {
          ...initialState,
          book: formatBookData(book, mockCmsBook),
          page,
        },
        navigation: { pathname: 'cool path name' },
      }) as any) as AppState;

      store = createTestStore(state);
    });

    const render = () => <Provider store={store}>
      <MessageProvider>
        <Attribution />
      </MessageProvider>
    </Provider>;

    it('removes listener when it unmounts', () => {
      const { root, node } = renderToDom(render());
      const details = node;

      details.removeEventListener = jest.fn();

      ReactDOM.unmountComponentAtNode(root);

      if (details) {
        expect(details.removeEventListener).toHaveBeenCalled();
      } else {
        expect(details).toBeTruthy();
      }
    });

    it('scrolls to details when toggled', async() => {
      const { node } = renderToDom(render());
      const details = node;

      if (!document) {
        return expect(document).toBeTruthy();
      }

      details.setAttribute('open', '');

      // wait for dom events to do their thing
      await new Promise((resolve) => setTimeout(resolve, 1));

      expect(scrollTo).toHaveBeenCalledWith(details, expect.anything());
    });

    it('closes attribution on navigation', async() => {
      const { node } = renderToDom(render());
      const details = node;

      if (!document) {
        return expect(document).toBeTruthy();
      }

      details.setAttribute('open', '');

      store.dispatch(actions.receivePage({...shortPage, references: []}));

      expect(details.getAttribute('open')).toBe(null);
    });

    it('doesn\'t close attribution when updating with the same page', async() => {
      const { node } = renderToDom(render());
      const details = node;

      if (!document) {
        return expect(document).toBeTruthy();
      }

      details.setAttribute('open', '');

      store.dispatch(actions.receiveBook(formatBookData(book, mockCmsBook)));

      expect(details.getAttribute('open')).toBe('');

      // clear scrollTo that happens on toggle before finishing the test
      // or there are errors
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    it('mounts and unmounts without a dom', () => {
      const element = renderer.create(render());

      expect(element.unmount).not.toThrow();
    });
  });

  describe('polyfill', () => {
    let loaded: boolean;

    beforeEach(() => {
      loaded = false;

      jest.mock('details-element-polyfill', () => {
        loaded = true;
      });
    });

    describe('inside browser', () => {
      it('loads', async() => {
        await import('./Attribution');
        expect(loaded).toBe(true);
      });
    });

    describe('outside of browser', () => {
      const documentBack = document;
      const windowBack = window;

      beforeEach(() => {
        delete (global as any).document;
        delete (global as any).window;
      });

      afterEach(() => {
        (global as any).document = documentBack;
        (global as any).window = windowBack;
      });

      it('doesn\'t load', async() => {

        await import('./Attribution');

        expect(loaded).toBe(false);
      });
    });
  });
});
