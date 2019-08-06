import { AppState } from '../types';
import { initialState } from './reducer';
import * as selectors from './selectors';

describe('localState', () => {
  it('returns errors state', () => {
    const rootState = {errors: initialState} as AppState;
    expect(selectors.localState(rootState)).toEqual(initialState);
  });
});

describe('code', () => {
  it('returns code', () => {
    const rootState = {errors: {
      ...initialState,
      code: 404,
    }} as AppState;

    expect(selectors.code(rootState)).toEqual(404);
  });
});
