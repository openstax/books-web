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
  let renderToDom: any;
  let TestContainer = require('../../../test/TestContainer').default; // tslint:disable-line:variable-name

  beforeEach(() => {
    jest.resetAllMocks();
    resetModules();
    React = require('react');
    ReactDOM = require('react-dom');
    renderer = require('react-test-renderer');
    renderToDom = require('../../../test/reactutils').renderToDom;
    TestContainer = require('../../../test/TestContainer').default;
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
        navigation: { pathname: '/cool path name' },
      }) as any) as AppState;

      store = createTestStore(state);
    });

    const render = () => <TestContainer store={store}>
      <Attribution />
    </TestContainer>;

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

      // We are testing if assertNotNull function is throwing error
      // and when it does then react makes a console.error with additional info.
      const spyConsoleError = jest.spyOn(console, 'error')
        .mockImplementationOnce(jest.fn)
      ;

      let message: string | undefined;

      try {
        renderer.create(render());
      } catch (e) {
        message = e.message;
      }

      expect(spyConsoleError).toHaveBeenCalledTimes(1);
      expect(message).toEqual('BUG: Could not find publication date');
    });

    it('displays first two contributing authors when no senior authors were found', () => {
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
      const { node: details } = renderToDom(render());
      details.setAttribute('open', '');

      expect(details.children[1].innerHTML).toMatch(`Authors: Jhon Doe, Jonny Doe`);
    });

    it('renders default attribution', async() => {
      store.dispatch(
        actions.receiveBook({...formatBookData(book, mockCmsBook)})
      );
      const component = renderer.create(render());
      expect(component).toMatchSnapshot();
    });

    it('renders special licensing and attribution for HS Physics', async() => {
      store.dispatch(
        actions.receiveBook({...formatBookData(book, mockCmsBook), id: 'cce64fde-f448-43b8-ae88-27705cceb0da'})
      );
      const component = renderer.create(render());
      expect(component).toMatchSnapshot();
    });

    it('renders special licensing and attribution for Statistics', async() => {
      store.dispatch(
        actions.receiveBook({...formatBookData(book, mockCmsBook), id: '394a1101-fd8f-4875-84fa-55f15b06ba66'})
      );
      const component = renderer.create(render());
      expect(component).toMatchSnapshot();
    });

    it('renders special licensing and attribution for Intellectual Property', async() => {
      store.dispatch(
        actions.receiveBook({...formatBookData(book, mockCmsBook), id: '1b4ee0ce-ee89-44fa-a5e7-a0db9f0c94b1'})
      );
      const component = renderer.create(render());
      expect(component).toMatchSnapshot();
    });
  });
});
