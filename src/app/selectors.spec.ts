import * as selectors from './selectors';
import { AppState } from './types';

describe('localState', () => {
  it('returns identity', () => {
    const appState = {} as AppState;
    expect(selectors.localState(appState)).toEqual(appState);
  });
});
