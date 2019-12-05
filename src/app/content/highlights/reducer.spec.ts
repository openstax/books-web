import { receiveFeatureFlags } from '../../actions';
import * as actions from './actions';
import { highlightingFeatureFlag } from './constants';
import reducer, { initialState } from './reducer';
import { HighlightData } from './types';

const mockHighlight = {
  id: 'asdf',
} as HighlightData;

describe('highlight reducer', () => {

  it('is initially disabled', () => {
    const newState = reducer(undefined, {type: 'adsf'} as any);
    expect(newState.enabled).toEqual(false);
  });

  it('activates feature flag', () => {
    const state = reducer({
      ...initialState,
      enabled: false,
    }, receiveFeatureFlags([highlightingFeatureFlag]));

    expect(state.enabled).toEqual(true);
  });

  it('doesn\'t active for other flags', () => {
    const state = reducer({
      ...initialState,
      enabled: false,
    }, receiveFeatureFlags(['asdf']));

    expect(state.enabled).toEqual(false);
  });

  it('focuses highlight', () => {
    const state = reducer(undefined, actions.focusHighlight('asdf'));
    expect(state.focused).toEqual('asdf');
  });

  it('clears focused highlight', () => {
    const state = reducer({...initialState, focused: 'asdf'}, actions.clearFocusedHighlight());
    expect(state.focused).toEqual(undefined);
  });

  it('removing the focused highlight also clears focus', () => {
    const state = reducer({
      ...initialState,
      focused: 'asdf',
      highlights: [mockHighlight],
    }, actions.deleteHighlight(mockHighlight.id));
    expect(state.focused).toEqual(undefined);
  });

  it('creates highlights', () => {
    const state = reducer(undefined, actions.createHighlight(mockHighlight as any));

    if (!(state.highlights instanceof Array)) {
      return expect(state.highlights).toBe(expect.any(Array));
    }
    expect(state.highlights.length).toEqual(1);
    expect(state.highlights[0].id).toEqual('asdf');
  });

  describe('deleteHighlight', () => {

    it('noops with no highlights', () => {
      const state = reducer({
        ...initialState,
      }, actions.deleteHighlight('asdf'));

      expect(state.highlights).toBe(null);
    });

    it('deletes', () => {
      const state = reducer({
        ...initialState,
        highlights: [mockHighlight],
      }, actions.deleteHighlight(mockHighlight.id));

      if (!(state.highlights instanceof Array)) {
        return expect(state.highlights).toBe(expect.any(Array));
      }

      expect(state.highlights.length).toEqual(0);
    });
  });

  describe('updateHighlight', () => {

    it('noops if there are no highlgihts', () => {
      const state = reducer({
        ...initialState,
      }, actions.updateHighlight({id: 'asdf', highlight: {annotation: 'asdf'}}));

      expect(state.highlights).toBe(null);
    });

    it('updates', () => {
      const mock1 = mockHighlight;
      const mock3 = {...mockHighlight, id: 'qwer'};

      const state = reducer({
        ...initialState,
        highlights: [mock1, mock3],
      }, actions.updateHighlight({id: mock1.id, highlight: {annotation: 'asdf'}}));

      if (!(state.highlights instanceof Array)) {
        return expect(state.highlights).toBe(expect.any(Array));
      }

      expect(state.highlights[0].annotation).toEqual('asdf');
      expect(state.highlights[1]).toEqual(mock3);
    });
  });
});
