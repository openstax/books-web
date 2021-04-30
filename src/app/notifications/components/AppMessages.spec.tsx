import ReactType from 'react';
import rendererType from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import TestContainer from '../../../test/TestContainer';
import { Store } from '../../types';
import { dismissNotification } from '../actions';
import { appMessageType } from '../reducer';
import AppMessage from './AppMessage';

describe('AppMessage', () => {
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

  it('dismisses message', () => {
    const notification = {
      payload: {
        dismissable: true,
        end_at: null,
        html: 'asdf',
        id: '1',
        start_at: null,
        url_regex: null,
      },
      type: appMessageType,
    };

    const component = renderer.create(<TestContainer store={store}>
      <AppMessage notification={notification} />
    </TestContainer>);

    component.root.findByType('button').props.onClick();

    expect(dispatch).toHaveBeenCalledWith(dismissNotification(notification));
  });
});
