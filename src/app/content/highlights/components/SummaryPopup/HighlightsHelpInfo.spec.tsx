import { MediaQueryList } from '@openstax/types/lib.dom';
import * as Cookies from 'js-cookie';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../../test/createTestServices';
import createTestStore from '../../../../../test/createTestStore';
import { receiveUser } from '../../../../auth/actions';
import { User } from '../../../../auth/types';
import { PlainButton } from '../../../../components/Button';
import * as Services from '../../../../context/Services';
import MessageProvider from '../../../../MessageProvider';
import { Store } from '../../../../types';
import HighlightsHelpInfo, { cookieId, timeBeforeShow } from './HighlightsHelpInfo';

jest.mock('js-cookie', () => ({
  ...jest.requireActual('js-cookie'),
  get: jest.fn(),
  set: jest.fn(),
}));

describe('HighlightsHelpInfo', () => {
  jest.useFakeTimers();
  let store: Store;
  let user: User;
  const services = createTestServices();

  beforeEach(() => {
    store = createTestStore();
    user = {firstName: 'test', isNotGdprLocation: true, uuid: 'a_uuid'};
  });

  it('matches snapshot when hidden', () => {
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <HighlightsHelpInfo/>
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('matches snapshot when showed', async() => {
    window!.matchMedia = () => ({matches: true}) as MediaQueryList;
    store.dispatch(receiveUser(user));

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <HighlightsHelpInfo/>
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    await renderer.act(async() => {
      jest.runTimersToTime(timeBeforeShow);
    });

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('does not open if user is not logged in', async() => {
    window!.matchMedia = () => ({matches: true}) as MediaQueryList;

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <HighlightsHelpInfo/>
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    await renderer.act(async() => {
      jest.runTimersToTime(timeBeforeShow);
    });

    expect(() => component.root.findByProps({ 'data-testid': 'support-link' })).toThrow();
  });

  it('does not open if not on mobile', async() => {
    window!.matchMedia = () => ({matches: false}) as MediaQueryList;

    store.dispatch(receiveUser(user));

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <HighlightsHelpInfo/>
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    await renderer.act(async() => {
      jest.runTimersToTime(timeBeforeShow);
    });

    expect(() => component.root.findByProps({ 'data-testid': 'support-link' })).toThrow();
  });

  it('does not open if cookie is already set', async() => {
    window!.matchMedia = () => ({matches: true}) as MediaQueryList;

    store.dispatch(receiveUser(user));

    const spy = jest.spyOn(Cookies, 'get');
    spy.mockImplementationOnce(() => 'true' as any);

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <HighlightsHelpInfo/>
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    await renderer.act(async() => {
      jest.runTimersToTime(timeBeforeShow);
    });

    expect(() => component.root.findByProps({ 'data-testid': 'support-link' })).toThrow();
  });

  it('set cookie on dismiss', async() => {
    window!.matchMedia = () => ({matches: true}) as MediaQueryList;

    store.dispatch(receiveUser(user));

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <HighlightsHelpInfo/>
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    await renderer.act(async() => {
      jest.runTimersToTime(timeBeforeShow);
    });

    await renderer.act(async() => {
      const dismissButton = component.root.findByType(PlainButton);
      dismissButton.props.onClick();
    });

    expect(Cookies.set).toHaveBeenCalledWith(cookieId, 'true');
  });
});
