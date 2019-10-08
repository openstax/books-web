import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import { makeFindByTestId } from '../../../test/reactutils';
import { recordError } from '../../errors/actions';
import { receiveMessages, updateAvailable } from '../../notifications/actions';
import { Store } from '../../types';
import Notifications from './Notifications';

describe('Notifications', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let consoleError: jest.SpyInstance;
  let component: renderer.ReactTestRenderer;

  beforeEach(() => {
    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');
    consoleError = jest.spyOn(console, 'error');
    component = renderer.create(<Provider store={store}>
      <Notifications />
    </Provider>);

    consoleError.mockImplementation(() => null);
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('dispatches updateAvailable', () => {
    const findById = makeFindByTestId(component.root);
    const button = findById('trigger-updates-available');

    renderer.act(() => {
      button.props.onClick();
    });
    expect(dispatch).toHaveBeenCalledWith(updateAvailable());
  });

  it('dispatches updateAvailable', () => {
    const findById = makeFindByTestId(component.root);
    const button = findById('trigger-modal-error');

    renderer.act(() => {
      button.props.onClick();
    });
    expect(dispatch).toHaveBeenCalledWith(recordError(expect.anything()));
  });

  it('dispatches receiveMessages', () => {
    const findById = makeFindByTestId(component.root);
    const button = findById('trigger-messages');

    renderer.act(() => {
      button.props.onClick();
    });
    expect(dispatch).toHaveBeenCalledWith(receiveMessages(expect.anything()));
  });

  it('throws on inline error', () => {
    const findById = makeFindByTestId(component.root);
    const button = findById('trigger-inline-error');

    expect(() =>
      renderer.act(() =>
        button.props.onClick()
      )
    ).toThrow();
  });
});
