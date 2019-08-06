import omit from 'lodash/fp/omit';
import pick from 'lodash/fp/pick';
import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { ActionType } from 'typesafe-actions';
import { AnyAction } from '../types';
import * as actions from './actions';
import searchReducer, {initialState as initialSearchState } from './search/reducer';
import { State } from './types';

export const initialState = {
  loading: {},
  references: [],
  search: initialSearchState,
  tocOpen: null,
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(actions.openToc):
      return {...state, tocOpen: true};
    case getType(actions.closeToc):
      return {...state, tocOpen: false};
    case getType(actions.resetToc):
      return {...state, tocOpen: null};
    case getType(actions.requestBook):
      return {...state, loading: {...state.loading, book: action.payload}};
    case getType(actions.receiveBook): {
      return reduceReceiveBook(state, action);
    }
    case getType(actions.requestPage):
      return {...state, loading: {...state.loading, page: action.payload}};
    case getType(actions.receivePage): {
      return reduceReceivePage(state, action);
    }
    default:
      const search = searchReducer(state.search, action);
      if (state.search !== search) {
        return {...state, search};
      }

      return state;
  }
};

export default reducer;

function reduceReceiveBook(state: State, action: ActionType<typeof actions.receiveBook>) {
  const loading = omit('book', state.loading);
  const book = pick([
    'id',
    'shortId',
    'title',
    'version',
    'tree',
    'theme',
    'slug',
    'license',
    'authors',
    'publish_date',
  ], action.payload);
  return {...state, loading, book};
}

function reduceReceivePage(state: State, action: ActionType<typeof actions.receivePage>) {
  const loading = omit('page', state.loading);
  const page = pick(['id', 'shortId', 'title', 'version'], action.payload);
  return {...state, loading, page, references: action.payload.references};
}
