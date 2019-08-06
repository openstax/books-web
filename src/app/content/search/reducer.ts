import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { locationChange } from '../../navigation/actions';
import { AnyAction } from '../../types';
import * as actions from './actions';
import { State } from './types';

export const initialState = {
  loading: false,
  query: null,
  results: null,
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(actions.requestSearch): {
      return {...state, loading: true, query: action.payload};
    }
    case getType(actions.receiveSearchResults): {
      return {...state, loading: false, results: action.payload};
    }
    case getType(actions.clearSearch): {
      return initialState;
    }
    case getType(locationChange): {
      return action.payload.action === 'PUSH' && !action.payload.location.state.search
        ? initialState
        : state;
    }
    default:
      return state;
  }
};

export default reducer;
