import { Location } from 'history';
import queryString from 'query-string';
import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { receiveDeleteHighlight } from '../content/highlights/actions';
import { isHighlightScrollTarget } from '../content/highlights/guards';
import { AnyAction } from '../types';
import * as actions from './actions';
import { isMatchWithParams } from './guards';
import { State } from './types';
import { getScrollTargetFromQuery } from './utils';

const addQuery = (location: Location) => ({
  ...location,
  query: queryString.parse(location.search),
});

export default (location: Location): Reducer<State, AnyAction> => (state = addQuery(location), action) => {
  switch (action.type) {
    case getType(actions.locationChange):
      const match = action.payload.match && isMatchWithParams(action.payload.match)
        ? action.payload.match
        : undefined;
      return {
        ...state,
        ...action.payload.location,
        match,
        query: action.payload.query,
      };
    case getType(receiveDeleteHighlight): {
      const scrollTarget = getScrollTargetFromQuery(state.query, state.hash);
      if (scrollTarget && isHighlightScrollTarget(scrollTarget) && scrollTarget.id === action.payload.id) {
        return {...state, search: '', hash: '', query: {}};
      }
      return state;
    }
    default:
      return state;
  }
};
