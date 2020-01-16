import equals from 'lodash/fp/equals';
import flow from 'lodash/fp/flow';
import omit from 'lodash/fp/omit';
import pick from 'lodash/fp/pick';
import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { ActionType } from 'typesafe-actions';
import { locationChange } from '../navigation/actions';
import { matchForRoute } from '../navigation/utils';
import { AnyAction } from '../types';
import * as actions from './actions';
import highlightReducer, {initialState as initialHighlightState } from './highlights/reducer';
import { content } from './routes';
import searchReducer, {initialState as initialSearchState } from './search/reducer';
import { State } from './types';
import { getPageSlug } from './utils/archiveTreeUtils';

export const initialState = {
  highlights: initialHighlightState,
  loading: {},
  params: null,
  references: [],
  search: initialSearchState,
  tocOpen: null,
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  return flow(
    (contentState) => {
      const search = searchReducer(contentState.search, action);
      if (contentState.search !== search) {
        return {...contentState, search};
      }
      return contentState;
    },
    (contentState) => {
      const highlights = highlightReducer(contentState.highlights, action);
      if (contentState.highlights !== highlights) {
        return {...contentState, highlights};
      }
      return contentState;
    }
  )(reduceContent(state, action));
};

export default reducer;

function reduceContent(state: State, action: AnyAction) {
  switch (action.type) {
    case getType(actions.openToc):
      return {...state, tocOpen: true};
    case getType(actions.closeToc):
      return {...state, tocOpen: false};
    case getType(actions.resetToc):
      return {...state, tocOpen: null};
    case getType(actions.requestBook):
      return {...state, loading: {...state.loading, ...action.payload}};
    case getType(actions.receiveBook): {
      return reduceReceiveBook(state, action);
    }
    case getType(actions.requestPage):
      return {...state, loading: {...state.loading, page: action.payload}};
    case getType(actions.receivePage): {
      return reduceReceivePage(state, action);
    }
    case getType(locationChange): {
      if (!matchForRoute(content, action.payload.match)) {
        return initialState;
      }

      if (!equals(action.payload.match.params, state.params)) {
        return {
          ...initialState,
          highlights: state.highlights,
          loading: state.loading,
          params: action.payload.match.params,
        };
      }

      if (state.book && state.page && action.payload.match.params.page !== getPageSlug(state.book, state.page)) {
        return {...omit(['page'], state), params: action.payload.match.params};
      }

      return {...state, params: action.payload.match.params};
    }
    default:
      return state;
  }
}

function reduceReceiveBook(state: State, action: ActionType<typeof actions.receiveBook>) {
  const loading = omit(['book', 'uuid'], state.loading);
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
  const page = pick(['abstract', 'id', 'shortId', 'title', 'version'], action.payload);
  return {...state, loading, page, references: action.payload.references};
}
