import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { receiveFeatureFlags } from '../../actions';
import { AnyAction } from '../../types';
import { studyGuidesFeatureFlag } from '../constants';
import * as actions from './actions';
import { State } from './types';

export const initialState: State = {
  isEnabled: false,
  summary: {
    open: false,
    studyguides: null,
  },
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(actions.receiveStudyGuides): {
      return {...state, summary: { ...state.summary, studyguides: action.payload } };
    }
    case getType(receiveFeatureFlags): {
      return {...state, isEnabled: action.payload.includes(studyGuidesFeatureFlag)};
    }
    case getType(actions.openStudyGuides):
      return {...state, summary: { ...state.summary, open: true }};
    case getType(actions.closeStudyGuides):
      return {...state, summary: { ...state.summary, open: false }};
    default:
      return state;
  }
};

export default reducer;
