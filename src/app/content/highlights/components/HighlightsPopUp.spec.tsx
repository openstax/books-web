import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import renderer, { act } from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { receiveFeatureFlags } from '../../../actions';
import { receiveUser } from '../../../auth/actions';
import { User } from '../../../auth/types';
import * as Services from '../../../context/Services';
import * as appGuards from '../../../guards';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import * as utils from '../../../utils';
import { assertNotNull } from '../../../utils';
import HighlightButton from '../../components/Toolbar/HighlightButton';
import { closeMyHighlights, openMyHighlights } from '../actions';
import { highlightingFeatureFlag } from '../constants';
import * as highlightSelectors from '../selectors';
import HighlightsPopUp from './HighlightsPopUp';

jest.spyOn(highlightSelectors, 'isEnabled')
  .mockReturnValue(true);

// this is a hack because useEffect is currently not called
// when using jsdom? https://github.com/facebook/react/issues/14050
// seems to work better in react-test-renderer but
// i need the ref here
jest.mock('react', () => {
  const react = (jest as any).requireActual('react');
  return { ...react, useEffect: react.useLayoutEffect };
});

describe('MyHighlights button and PopUp', () => {
  let dispatch: jest.SpyInstance;
  let store: Store;
  let user: User;
  let services: ReturnType<typeof createTestServices>;

  beforeEach(() => {
    services = createTestServices();
    store = createTestStore();
    user = {firstName: 'test', isNotGdprLocation: true, uuid: 'some_uuid'};

    store.dispatch(receiveFeatureFlags([highlightingFeatureFlag]));

    dispatch = jest.spyOn(store, 'dispatch');
  });

  it('opens pop up in "not logged in" state', () => {
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <HighlightButton />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    act(() => {
      /* fire events that update state */
      component.root.findByType('button').props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(openMyHighlights());
  });

  it('closes pop up', async() => {
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <HighlightsPopUp />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    act(() => { store.dispatch(openMyHighlights()); });
    act(() => {
      component.root.findByProps({ 'data-testid': 'close-highlights-popup' })
      .props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(closeMyHighlights());
  });

  it('opens pop up in "logged in" state', async() => {
    store.dispatch(receiveUser(user));

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <HighlightButton />
          <HighlightsPopUp />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    act(() => {
      /* fire events that update state */
      component.root.findByType('button').props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(openMyHighlights());
  });

  it('focus is on pop up content', async() => {
    const focus = jest.fn();
    const addEventListener = jest.fn();
    const createNodeMock = () => ({focus, addEventListener});

    renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <HighlightsPopUp />
        </MessageProvider>
      </Services.Provider>
    </Provider>, {createNodeMock});

    const isHtmlElement = jest.spyOn(appGuards, 'isHtmlElement');
    isHtmlElement.mockReturnValueOnce(true);

    act(() => { store.dispatch(openMyHighlights()); });
    // Force componentDidUpdate()
    act(() => { store.dispatch(receiveUser(user)); });

    expect(focus).toHaveBeenCalled();
  });

  it('handles event listeners on mount and unmount for onEsc util', () => {
    const focus = jest.fn();
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();
    const createNodeMock = () => ({focus, addEventListener, removeEventListener});

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <HighlightsPopUp />
        </MessageProvider>
      </Services.Provider>
    </Provider>, {createNodeMock});

    const isHtmlElement = jest.spyOn(appGuards, 'isHtmlElement');

    isHtmlElement.mockReturnValueOnce(true);

    act(() => { store.dispatch(openMyHighlights()); });

    expect(addEventListener).toHaveBeenCalled();

    component.unmount();

    expect(removeEventListener).toHaveBeenCalled();
  });

  it('handles event listeners on component update for onEsc util', () => {
    const focus = jest.fn();
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();
    const createNodeMock = () => ({focus, addEventListener, removeEventListener});

    renderer.create(<Provider store={{...store, }}>
      <Services.Provider value={services}>
        <MessageProvider>
          <HighlightsPopUp />
        </MessageProvider>
      </Services.Provider>
    </Provider>, {createNodeMock});

    const isHtmlElement = jest.spyOn(appGuards, 'isHtmlElement');

    isHtmlElement.mockReturnValue(true);

    act(() => { store.dispatch(openMyHighlights()); });

    expect(addEventListener).toHaveBeenCalled();

    // Force componentDidUpdate()
    act(() => { store.dispatch(closeMyHighlights()); });

    expect(removeEventListener).toHaveBeenCalled();
  });

  it('closes popup on esc and tracks analytics', async() => {
    store.dispatch(openMyHighlights());
    store.dispatch(receiveUser(user));

    const { node } = renderToDom(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <HighlightsPopUp />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    const track = jest.spyOn(services.analytics.openCloseMH, 'track');
    const element = assertNotNull(node.querySelector('[data-testid=\'highlights-popup-wrapper\']'), '');

    element.dispatchEvent(new ((window as any).KeyboardEvent)('keydown', {key: 'Escape'}));

    expect(track).toHaveBeenCalled();

  });

  it('closes popup on overlay click and tracks analytics', async() => {
    const window = utils.assertWindow();
    store.dispatch(openMyHighlights());
    store.dispatch(receiveUser(user));

    const { node } = renderToDom(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <HighlightsPopUp />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    const track = jest.spyOn(services.analytics.openCloseMH, 'track');
    const element = assertNotNull(node.querySelector('[data-testid=\'highlights-popup-overlay\']'), '');

    const event = window.document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    const preventDefault = event.preventDefault = jest.fn();

    element.dispatchEvent(event); // this checks for bindings using addEventListener
    ReactTestUtils.Simulate.click(element, {preventDefault}); // this checks for react onClick prop

    expect(track).toHaveBeenCalled();

  });
});
