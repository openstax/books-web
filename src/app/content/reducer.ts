import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import * as navigation from '../navigation';
import { AnyAction } from '../types';
import * as actions from './actions';
import { content } from './routes';
import { State } from './types';

export const initialState = {
  tocOpen: true,
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(actions.openToc):
      return {...state, tocOpen: true};
    case getType(actions.closeToc):
      return {...state, tocOpen: false};
    case getType(navigation.actions.locationChange):
      return navigation.utils.matchForRoute(content, action.payload.match)
        ? {...state, params: action.payload.match.params}
        : state;
    default:
      return state;
  }
};

export default reducer;
