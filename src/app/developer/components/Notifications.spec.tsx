import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { createStore } from 'redux';
import { updateAvailable } from '../../notifications/actions';
import { AppState } from '../../types';
import Notifications from './Notifications';

describe('Notifications', () => {

  it('dispatches updateAvailable', () => {
    const state = {} as AppState;
    const store = createStore((_: undefined | AppState) => state, state);
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    const component = renderer.create(<Provider store={store}>
      <Notifications />
    </Provider>);

    component.root.findByType('button').props.onClick();

    expect(dispatchSpy).toHaveBeenCalledWith(updateAvailable());
  });
});
