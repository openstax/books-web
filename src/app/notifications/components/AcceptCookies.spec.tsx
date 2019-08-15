import ReactType from 'react';
import { Provider } from 'react-redux';
import rendererType from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import MessageProvider from '../../MessageProvider';
import { Store } from '../../types';
import { acceptCookies, dismissNotification } from '../actions';
import AcceptCookies from './AcceptCookies';

describe('AcceptCookies', () => {
  let renderer: typeof rendererType;
  let React: typeof ReactType; // tslint:disable-line:variable-name
  let dispatch: jest.SpyInstance;
  let store: Store;

  beforeEach(() => {
    React = require('react');
    renderer = require('react-test-renderer');
    store = createTestStore();

    dispatch = jest.spyOn(store, 'dispatch');
  });

  it('dimsises notification', () => {
    const notification = acceptCookies();

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <AcceptCookies notification={notification} />
      </MessageProvider>
    </Provider>);

    component.root.findByType('button').props.onClick();

    expect(dispatch).toHaveBeenCalledWith(dismissNotification(notification));
  });
});
