import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import MessageProvider from '../../MessageProvider';
import { Store } from '../../types';
import { acceptCookies, updateAvailable } from '../actions';
import ConnectedNotifications from './Notifications';

describe('Notifications', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('matches snapshot', () => {
    store.dispatch(updateAvailable());
    store.dispatch(acceptCookies());

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ConnectedNotifications />
      </MessageProvider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for unknown notification', () => {
    store.getState().notifications.push({type: 'foobar'} as any);

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ConnectedNotifications />
      </MessageProvider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
