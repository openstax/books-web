import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { AnyAction } from '../types';
import * as actions from './actions';
import { State } from './types';

export const initialState = [];

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(actions.updateAvailable):
      return state.find(({type}) => type === action.type)
        ? state
        : [...state, action];
    default:
      return state;
  }
};

export default reducer;
