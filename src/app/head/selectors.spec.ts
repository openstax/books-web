import { AppState } from '../types';
import { initialState } from './reducer';
import * as selectors from './selectors';

describe('localState', () => {
  it('returns errors state', () => {
    const rootState = {head: initialState} as any as AppState;
    expect(selectors.localState(rootState)).toEqual(initialState);
  });
});

describe('meta', () => {
  it('returns meta', () => {
    const rootState = {head: {
      ...initialState,
      meta: ['one', 'two'],
    }} as any as AppState;

    expect(selectors.meta(rootState)).toEqual(['one', 'two']);
  });
});

describe('title', () => {
  it('returns title', () => {
    const rootState = {head: {
      ...initialState,
      title: 'foobar',
    }} as any as AppState;

    expect(selectors.title(rootState)).toEqual('foobar');
  });
});
