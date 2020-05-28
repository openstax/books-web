import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import renderer, { act } from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { renderToDom } from '../../../../test/reactutils';
import { receiveUser } from '../../../auth/actions';
import { User } from '../../../auth/types';
import * as Services from '../../../context/Services';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import * as utils from '../../../utils';
import { assertNotNull } from '../../../utils';
import { closeStudyGuides, openStudyGuides } from '../actions';
import StudyguidesPopUp from './StudyguidesPopUp';

// this is a hack because useEffect is currently not called
// when using jsdom? https://github.com/facebook/react/issues/14050
// seems to work better in react-test-renderer but
// i need the ref here
jest.mock('react', () => {
  const react = (jest as any).requireActual('react');
  return { ...react, useEffect: react.useLayoutEffect };
});

describe('Study Guides button and PopUp', () => {
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

  it('closes pop up with close button', async() => {
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <StudyguidesPopUp />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    act(() => { store.dispatch(openStudyGuides()); });
    act(() => {
      component.root.findByProps({ 'data-testid': 'close-studyguides-popup' })
      .props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(closeStudyGuides());
  });

  it('closes popup on esc and tracks analytics', async() => {
    store.dispatch(openStudyGuides());
    store.dispatch(receiveUser(user));

    const { node } = renderToDom(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <StudyguidesPopUp />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    const track = jest.spyOn(services.analytics.openCloseStudyGuides, 'track');
    const element = assertNotNull(node.querySelector('[data-testid=\'studyguides-popup-wrapper\']'), '');

    element.dispatchEvent(new ((window as any).KeyboardEvent)('keydown', {key: 'Escape'}));

    expect(track).toHaveBeenCalled();

  });

  it('closes popup on overlay click and tracks analytics', async() => {
    const window = utils.assertWindow();
    store.dispatch(openStudyGuides());
    store.dispatch(receiveUser(user));

    const { node } = renderToDom(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <StudyguidesPopUp />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    const track = jest.spyOn(services.analytics.openCloseStudyGuides, 'track');
    const element = assertNotNull(node.querySelector('[data-testid=\'scroll-lock-overlay\']'), '');

    const event = window.document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    const preventDefault = event.preventDefault = jest.fn();

    element.dispatchEvent(event); // this checks for bindings using addEventListener
    ReactTestUtils.Simulate.click(element, {preventDefault}); // this checks for react onClick prop

    expect(track).toHaveBeenCalled();

  });
});
