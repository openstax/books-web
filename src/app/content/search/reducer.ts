import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { locationChange } from '../../navigation/actions';
import { AnyAction } from '../../types';
import { openToc } from '../actions';
import * as actions from './actions';
import { State } from './types';

export const initialState = {
  currentExcerpt: null,
  loading: false,
  mobileOpen: false,
  query: null,
  results: null,
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {

  switch (action.type) {
    case getType(actions.requestSearch): {
      return {...initialState, loading: true, query: action.payload, mobileOpen: true};
    }
    case getType(actions.receiveSearchResults): {
      return {...state, loading: false, results: action.payload};
    }
    case getType(openToc):
    case getType(actions.clearSearch): {
      return initialState;
    }
    case getType(locationChange): {
      return action.payload.action === 'PUSH' && !action.payload.location.state.search
        ? initialState
        : state;
    }
    case getType(actions.openSearchResultsMobile): {
      return {...state, mobileOpen: true};
    }
    case getType(actions.closeSearchResultsMobile): {
      return {...state, mobileOpen: false};
    }
    case getType(actions.setCurrentExcerpt): {
      return {...state, currentExcerpt: action.payload};
    }
    default:
      return state;
  }
};

export default reducer;
