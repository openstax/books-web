import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import renderer, { act } from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { renderToDom } from '../../../../test/reactutils';
import TestContainer from '../../../../test/TestContainer';
import { receiveUser } from '../../../auth/actions';
import { User } from '../../../auth/types';
import * as appGuards from '../../../guards';
import { Store } from '../../../types';
import * as utils from '../../../utils';
import { assertNotNull } from '../../../utils';
import { receiveBook } from '../../actions';
import HighlightButton from '../../components/Toolbar/HighlightButton';
import { CloseIcon, Header } from '../../styles/PopupStyles';
import { formatBookData } from '../../utils';
import { closeMyHighlights, openMyHighlights } from '../actions';
import HighlightsPopUp from './HighlightsPopUp';

// this is a hack because useEffect is currently not called
// when using jsdom? https://github.com/facebook/react/issues/14050
// seems to work better in react-test-renderer but
// i need the ref here
jest.mock('react', () => {
  const react = (jest as any).requireActual('react');
  return { ...react, useEffect: react.useLayoutEffect };
});

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: any) => children,
}));

describe('MyHighlights button and PopUp', () => {
  let dispatch: jest.SpyInstance;
  let store: Store;
  let user: User;
  let services: ReturnType<typeof createTestServices>;

  beforeEach(() => {
    services = createTestServices();
    store = createTestStore();
    user = {firstName: 'test', isNotGdprLocation: true, uuid: 'some_uuid'};

    dispatch = jest.spyOn(store, 'dispatch');
  });

  it('opens pop up in "not logged in" state', () => {
    const component = renderer.create(<TestContainer services={services} store={store}>
      <HighlightButton />
    </TestContainer>);

    act(() => {
      /* fire events that update state */
      component.root.findByType('button').props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(openMyHighlights());
  });

  it('closes pop up', async() => {
    const component = renderer.create(<TestContainer services={services} store={store}>
      <HighlightsPopUp />
    </TestContainer>);

    act(() => { store.dispatch(openMyHighlights()); });
    act(() => {
      component.root.findByProps({ 'data-testid': 'close-highlights-popup' })
      .props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(closeMyHighlights());
  });

  it('opens pop up in "logged in" state', async() => {
    store.dispatch(receiveUser(user));

    const component = renderer.create(<TestContainer services={services} store={store}>
      <HighlightButton />
      <HighlightsPopUp />
    </TestContainer>);

    act(() => {
      /* fire events that update state */
      component.root.findByType('button').props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(openMyHighlights());
  });

  it('focus is on pop up content', async() => {
    const focus = jest.fn();
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();
    const querySelectorAll = jest.fn(() => []);
    const getAttribute = jest.fn();
    const setAttribute = jest.fn();
    const removeAttribute = jest.fn();
    const createNodeMock = () => ({
      addEventListener,
      focus,
      getAttribute,
      querySelectorAll,
      removeAttribute,
      removeEventListener,
      setAttribute,
    });

    renderer.create(<TestContainer services={services} store={store}>
      <HighlightsPopUp />
    </TestContainer>, {createNodeMock});

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

    const component = renderer.create(<TestContainer services={services} store={store}>
          <HighlightsPopUp />
    </TestContainer>, {createNodeMock});

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

    renderer.create(<TestContainer services={services} store={store}>
      <HighlightsPopUp />
    </TestContainer>, {createNodeMock});

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

    const { node } = renderToDom(<TestContainer services={services} store={store}>
      <HighlightsPopUp />
    </TestContainer>);

    const track = jest.spyOn(services.analytics.openCloseMH, 'track');
    const element = assertNotNull(node.querySelector('[data-testid=\'highlights-popup-wrapper\']'), '');

    element.dispatchEvent(new ((window as any).KeyboardEvent)('keydown', {key: 'Escape'}));

    expect(track).toHaveBeenCalled();

  });

  it('closes popup on overlay click and tracks analytics', async() => {
    const window = utils.assertWindow();
    store.dispatch(openMyHighlights());
    store.dispatch(receiveUser(user));

    const { node } = renderToDom(<TestContainer services={services} store={store}>
      <HighlightsPopUp />
    </TestContainer>);

    const track = jest.spyOn(services.analytics.openCloseMH, 'track');
    const element = assertNotNull(node.querySelector('[data-testid=\'scroll-lock-overlay\']'), '');

    const event = window.document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    const preventDefault = event.preventDefault = jest.fn();

    element.dispatchEvent(event); // this checks for bindings using addEventListener
    ReactTestUtils.Simulate.click(element, {preventDefault}); // this checks for react onClick prop

    expect(track).toHaveBeenCalled();

  });

  it('changes colors based on book theme', () => {
    const book = formatBookData(archiveBook, mockCmsBook);

    store.dispatch(receiveUser(user));
    store.dispatch(receiveBook(book));
    store.dispatch(openMyHighlights());

    const focus = jest.fn();
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();
    const querySelectorAll = jest.fn(() => []);
    const getAttribute = jest.fn();
    const setAttribute = jest.fn();
    const removeAttribute = jest.fn();
    const createNodeMock = () => ({
      addEventListener,
      focus,
      getAttribute,
      querySelectorAll,
      removeAttribute,
      removeEventListener,
      setAttribute,
    });

    const component = renderer.create(<TestContainer services={services} store={store}>
      <HighlightsPopUp />
    </TestContainer>, {createNodeMock});

    const header = component.root.findByType(Header);
    const closeIcon = component.root.findByType(CloseIcon);

    expect(header.props.colorSchema).toBe(book.theme);
    expect(closeIcon.props.colorSchema).toBe(book.theme);

    renderer.act(() => {
      store.dispatch(closeMyHighlights());
      store.dispatch(receiveBook({...book, theme: 'yellow'}));
      store.dispatch(openMyHighlights());
    });

    expect(header.props.colorSchema).toBe('yellow');
    expect(closeIcon.props.colorSchema).toBe('yellow');
  });
});
