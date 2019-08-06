import { openToc } from '../content/actions';
import { content } from '../content/routes';
import { locationChange } from '../navigation/actions';
import reducer, { initialState } from './reducer';
import { notFound } from './routes';

describe('error reducer', () => {

  it('reduces locationChange with no match', () => {
    const state = {
      ...initialState,
      code: 200,
    };
    const location = {
      hash: '',
      pathname: '',
      search: '',
      state: {},
    };
    const newState = reducer(state, locationChange({location, action: 'PUSH'}));

    expect(newState.code).toEqual(404);
  });

  it('reduces locationChange with notFound match', () => {
    const state = {
      ...initialState,
      code: 200,
    };
    const location = {
      hash: '',
      pathname: '',
      search: '',
      state: {},
    };
    const match = {route: notFound};
    const newState = reducer(state, locationChange({location, match, action: 'PUSH'}));

    expect(newState.code).toEqual(404);
  });

  it('reduces locationChange with other match', () => {
    const state = {
      ...initialState,
      code: 404,
    };
    const location = {
      hash: '',
      pathname: '',
      search: '',
      state: {},
    };
    const match = {
      params: {book: 'book', page: 'page'},
      route: content,
    };
    const newState = reducer(state, locationChange({location, match, action: 'POP'}));

    expect(newState.code).toEqual(200);
  });

  it('returns state identity for unknown action', () => {
    const newState = reducer(initialState, openToc());
    expect(newState).toEqual(initialState);
  });
});
