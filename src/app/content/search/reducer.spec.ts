import flow from 'lodash/fp/flow';
import { locationChange } from '../../navigation/actions';
import { AnyAction } from '../../types';
import { assertWindow } from '../../utils';
import * as actions from './actions';
import reducer, { initialState } from './reducer';
import { State } from './types';

describe('search reducer', () => {
  it('reduces requestSearch', () => {
    const query = 'asdf';
    const state = {
      ...initialState,
      loading: false,
      query: null,
    };
    const newState = reducer(state, actions.requestSearch(query));
    expect(newState.loading).toEqual(true);
    expect(newState.query).toEqual(query);
  });

  it('reduces receiveSearchResults', () => {
    const results = {
      hits: {
        hits: [],
        total: 0,
      },
      overallTook: 0,
      shards: {},
      timedOut: false,
      took: 0,
    };
    const state = {
      ...initialState,
      loading: true,
      results: null,
    };
    const newState = reducer(state, actions.receiveSearchResults(results));
    expect(newState.loading).toEqual(false);
    expect(newState.results).toEqual(results);
  });

  it('sets initial state', () => {
    const newState = reducer(undefined, {type: 'asdf'} as unknown as AnyAction);
    expect(newState).toEqual(initialState);
  });

  it('reduces clearSearch', () => {
    const state = {
      ...initialState,
      loading: true,
      query: 'asdfasdf',
    };
    const newState = reducer(state, actions.clearSearch());
    expect(newState).toBe(initialState);
    expect(newState.query).toEqual(null);
  });

  it('clears state when location is PUSHed without search query', () => {
    const state = {
      ...initialState,
      loading: true,
      query: 'asdfasdf',
    };
    const newState = reducer(state, locationChange({
      action: 'PUSH',
      location: {
        ...assertWindow().location,
        state: {},
      },
    }));
    expect(newState).toBe(initialState);
    expect(newState.query).toEqual(null);
  });

  it('doesn\'t clear state when location is PUSHed with a search query', () => {
    const state = {
      ...initialState,
      loading: true,
      query: 'asdfasdf',
    };
    const newState = reducer(state, locationChange({
      action: 'PUSH',
      location: {
        ...assertWindow().location,
        state: {
          search: 'asdf',
        },
      },
    }));
    expect(newState).toBe(state);
  });

  it('doesn\'t clear state when location is POPd with or without a search query', () => {
    const state = {
      ...initialState,
      loading: true,
      query: 'asdfasdf',
    };

    const newState = flow(
      (s: State): State => reducer(s, locationChange({
        action: 'POP',
        location: {
          ...assertWindow().location,
          state: {},
        },
      })),
      (s: State): State => reducer(s, locationChange({
        action: 'POP',
        location: {
          ...assertWindow().location,
          state: {
            search: 'asdf',
          },
        },
      }))
    )(state);

    expect(newState).toBe(state);
  });

  it('doesn\'t clear state when location is REPLACEd with or without a search query', () => {
    const state = {
      ...initialState,
      loading: true,
      query: 'asdfasdf',
    };

    const newState = flow(
      (s: State): State => reducer(s, locationChange({
        action: 'REPLACE',
        location: {
          ...assertWindow().location,
          state: {},
        },
      })),
      (s: State): State => reducer(s, locationChange({
        action: 'REPLACE',
        location: {
          ...assertWindow().location,
          state: {
            search: 'asdf',
          },
        },
      }))
    )(state);

    expect(newState).toBe(state);
  });
});
