import { ComponentClass } from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import createTestStore from '../../../test/createTestStore';
import { receiveLoggedOut, receiveUser } from '../../auth/actions';
import MessageProvider from '../../MessageProvider';
import { Store } from '../../types';
import { assertWindow } from '../../utils';
let React: any; // tslint:disable-line:variable-name
let renderer: any;
let Provider: any; // tslint:disable-line:variable-name
let renderToDom: any;

describe('content', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
    React = require('react');
    Provider = require('react-redux').Provider;
    renderer = require('react-test-renderer');
    renderToDom = require('../../../test/reactutils').renderToDom;
  });

  describe('in browser', () => {
    // tslint:disable-next-line:variable-name
    let NavBar: any;
    // tslint:disable-next-line:variable-name
    let Dropdown: any;
    let store: Store;

    beforeEach(() => {
      store = createTestStore();
      NavBar = require('.').default;
      Dropdown = require('.').Dropdown;
    });

    const render = () => <Provider store={store}>
      <MessageProvider>
        <NavBar />
      </MessageProvider>
    </Provider>;

    it('matches snapshot for null state', () => {
      const component = renderer.create(render());

      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    describe('when logged in', () => {
      beforeEach(() => {
        store.dispatch(receiveUser({firstName: 'test'}));
      });

      it('matches snapshot', () => {
        const component = renderer.create(render());

        const tree = component.toJSON();
        expect(tree).toMatchSnapshot();
      });

      it('doesn\'t prevent default on accounts links', async() => {
        const window = assertWindow();
        const {root} = renderToDom(render());
        const link1 = root.querySelector('a[href^="/accounts/logout"]');
        const link2 = root.querySelector('a[href="/accounts/profile"]');

        if (!link1 || !link2) {
          expect(link1).toBeTruthy();
          expect(link2).toBeTruthy();
          return;
        }

        const event = window.document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        const preventDefault = event.preventDefault = jest.fn();

        link1.dispatchEvent(event); // this checks for bindings using addEventListener
        ReactTestUtils.Simulate.click(link1, {preventDefault}); // this checks for react onClick prop
        link2.dispatchEvent(event);
        ReactTestUtils.Simulate.click(link2, {preventDefault});

        expect(event.preventDefault).not.toHaveBeenCalled();
      });
    });

    it('matches snapshot for logged out', () => {

      store.dispatch(receiveLoggedOut());

      const component = renderer.create(render());

      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    describe('manages scroll based on ovelay', () => {
      let window: Window;
      let getComputedStyle: jest.SpyInstance;
      let getComputedStyleBack: Window['getComputedStyle'];

      beforeEach(() => {
        store.dispatch(receiveUser({firstName: 'test'}));
        window = assertWindow();
        getComputedStyleBack = window.getComputedStyle;
        getComputedStyle = window.getComputedStyle = jest.fn();
      });

      afterEach(() => {
        window.getComputedStyle = getComputedStyleBack;
      });

      it('blocks scroll when shown', () => {
        const {tree} = renderToDom(render());
        const overlayComponent = ReactTestUtils.findRenderedComponentWithType(
          tree,
          Dropdown as unknown as ComponentClass // ReactTestUtils types seem broken
        );
        const overlay = ReactDOM.findDOMNode(overlayComponent);

        getComputedStyle.mockReturnValue({height: '10px'});

        const event = window.document.createEvent('UIEvents');
        event.initEvent('scroll', true, false);
        const preventDefault = jest.spyOn(event, 'preventDefault');

        window.document.dispatchEvent(event);

        expect(getComputedStyle).toHaveBeenCalledWith(overlay);
        expect(preventDefault).toHaveBeenCalled();
      });

      it('allows scroll when hidden', () => {
        const {tree} = renderToDom(render());
        const overlayComponent = ReactTestUtils.findRenderedComponentWithType(
          tree,
          Dropdown as unknown as ComponentClass // ReactTestUtils types seem broken
        );
        const overlay = ReactDOM.findDOMNode(overlayComponent);

        getComputedStyle.mockReturnValue({height: '0px'});

        const event = window.document.createEvent('UIEvents');
        event.initEvent('scroll', true, false);
        const preventDefault = jest.spyOn(event, 'preventDefault');

        window.document.dispatchEvent(event);

        expect(getComputedStyle).toHaveBeenCalledWith(overlay);
        expect(preventDefault).not.toHaveBeenCalled();
      });
    });
  });

  describe('polyfill', () => {
    let loaded: boolean;

    beforeEach(() => {
      loaded = false;

      jest.mock('ally.js/style/focus-within', () => {
        loaded = true;
      });
    });

    describe('inside browser', () => {
      it('loads', async() => {
        await import('.');
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
        await import('.');
        expect(loaded).toBe(false);
      });
    });
  });
});
