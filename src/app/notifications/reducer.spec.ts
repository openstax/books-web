import * as actions from './actions';
import reducer, { initialState } from './reducer';

describe('notifications reducer', () => {

  it('adds update available notification', () => {
    const newState = reducer(initialState, actions.updateAvailable());
    expect(newState).toContainEqual(actions.updateAvailable());
  });

  it('doesn\'t duplicate update available notification', () => {
    const state = [actions.updateAvailable()];
    const newState = reducer(state, actions.updateAvailable());
    expect(newState).toBe(state);
  });
});
