import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { AnyAction } from '../types';
import * as actions from './actions';
import { State } from './types';

export const initialState = {
  established: false,
  user: undefined,
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(actions.receiveUser):
      return {...state, user: action.payload, established: true};
    case getType(actions.receiveLoggedOut):
      return {...state, user: undefined, established: true};
    default:
      return state;
  }
};

export default reducer;
