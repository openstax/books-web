import cloneDeep from 'lodash/fp/cloneDeep';
import createTestStore from '../../../test/createTestStore';
import { book, page, shortPage } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { resetModules } from '../../../test/utils';
import { AppState, Store } from '../../types';
import * as actions from '../actions';
import { initialState } from '../reducer';
import { formatBookData } from '../utils';

describe('Attribution', () => {
  let React: any; // tslint:disable-line:variable-name
  let ReactDOM: any; // tslint:disable-line:variable-name
  let renderer: any;
  let Provider: any; // tslint:disable-line:variable-name
  let renderToDom: any;
  let MessageProvider = require('../../MessageProvider').default; // tslint:disable-line:variable-name

  beforeEach(() => {
    jest.resetAllMocks();
    resetModules();
    React = require('react');
    ReactDOM = require('react-dom');
    Provider = require('react-redux').Provider;
    renderer = require('react-test-renderer');
    renderToDom = require('../../../test/reactutils').renderToDom;
    MessageProvider = require('../../MessageProvider').default;
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

    it('throws if cms doesn\'t return a publication date ', () => {
      const newState = (cloneDeep({
        content: {
          ...initialState,
          book: formatBookData(book, { ...mockCmsBook, publish_date: null} ),
          page,
        },
        navigation: { pathname: 'cool path name' },
      }) as any) as AppState;

      store = createTestStore(newState);

      let message: string | undefined;

      try {
        renderer.create(render());
      } catch (e) {
        message = e.message;
      }

      expect(message).toEqual('BUG: Could not find publication date');
    });

    it('displays first two contributing authors when no senior authors were found', async() => {
      const newState = (cloneDeep({
        content: {
          ...initialState,
          book: formatBookData(book, { ...mockCmsBook,
            authors: [
              {value: {name: 'Jhon Doe', senior_author: false}},
              {value: {name: 'Jonny Doe', senior_author: false}},
            ],
          }),
        },
      }) as any) as AppState;

      store = createTestStore(newState);
      const { node } = renderToDom(render());
      const details = node;
      details.setAttribute('open', '');

      // wait for dom events to do their thing
      await new Promise((resolve) => setTimeout(resolve, 1));

      expect(details.children[1].innerHTML).toMatch(`Authors: Jhon Doe, Jonny Doe`);
    });
  });
});
