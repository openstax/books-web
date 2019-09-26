import { ComponentClass } from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import createTestStore from '../../../test/createTestStore';
import { reactAndFriends, resetModules } from '../../../test/utils';
import { receiveLoggedOut, receiveUser } from '../../auth/actions';
import { User } from '../../auth/types';
import { Store } from '../../types';
import { assertWindow } from '../../utils';

describe('content', () => {
  let React: ReturnType<typeof reactAndFriends>['React']; // tslint:disable-line:variable-name
  let renderer: ReturnType<typeof reactAndFriends>['renderer'];
  let Provider: ReturnType<typeof reactAndFriends>['Provider']; // tslint:disable-line:variable-name
  let renderToDom: ReturnType<typeof reactAndFriends>['renderToDom'];
  let ReactDOM: ReturnType<typeof reactAndFriends>['ReactDOM']; // tslint:disable-line:variable-name
  let MessageProvider: ReturnType<typeof reactAndFriends>['MessageProvider']; // tslint:disable-line:variable-name

  beforeEach(() => {
    resetModules();
    jest.resetAllMocks();
    ({React, Provider, renderer, ReactDOM, renderToDom, MessageProvider} = reactAndFriends());
  });

  describe('in browser', () => {
    // tslint:disable-next-line:variable-name
    let NavBar: any;
    // tslint:disable-next-line:variable-name
    let Dropdown: any;
    let store: Store;
    let user: User;

    beforeEach(() => {
      user = {firstName: 'test', isNotGdprLocation: true, uuid: 'some_uuid'};
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
      component.unmount();

      expect(tree).toMatchSnapshot();
    });

    describe('when logged in', () => {
      beforeEach(() => {
        store.dispatch(receiveUser(user));
      });

      it('matches snapshot', () => {
        const component = renderer.create(render());
        const tree = component.toJSON();
        component.unmount();

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
      component.unmount();

      expect(tree).toMatchSnapshot();
    });

    describe('manages scroll based on ovelay', () => {
      let window: Window;
      let getComputedStyle: jest.SpyInstance;
      let getComputedStyleBack: Window['getComputedStyle'];

      beforeEach(() => {
        store.dispatch(receiveUser(user));
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

      it('noops without a dom', () => {
        const element = renderer.create(render());
        const OnScroll = require('../OnScroll').default; // tslint:disable-line:variable-name
        const onScroll = element.root.findByType(OnScroll);

        const event = window.document.createEvent('UIEvents');
        event.initEvent('scroll', true, false);
        const preventDefault = jest.spyOn(event, 'preventDefault');

        onScroll.props.callback(event);

        expect(getComputedStyle).not.toHaveBeenCalled();
        expect(preventDefault).not.toHaveBeenCalled();
      });
    });
  });

  describe('polyfill', () => {
    let loaded: boolean;

    beforeEach(() => {
      loaded = false;

      jest.doMock('focus-within-polyfill', () => {
        loaded = true;
      });
    });

    describe('inside browser', () => {
      it('loads', async() => {
        require('.');
        await Promise.resolve();
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
        require('.');
        await Promise.resolve();
        expect(loaded).toBe(false);
      });
    });
  });
});
