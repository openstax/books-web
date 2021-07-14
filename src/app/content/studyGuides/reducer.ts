import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { receiveFeatureFlags } from '../../featureFlags/actions';
import { locationChange } from '../../navigation/actions';
import { AnyAction } from '../../types';
import { merge } from '../../utils';
import { modalQueryParameterName, studyGuidesFeatureFlag } from '../constants';
import * as actions from './actions';
import { modalUrlName } from './constants';
import { State } from './types';
import { getFiltersFromQuery } from './utils';

export const initialState: State = {
  isEnabled: false,
  summary: {
    filters: {
      colors: [],
      locationIds: [],
    },
    loading: false,
    open: false,
    pagination: null,
    studyGuides: null,
    totalCountsPerPage: null,
  },
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(locationChange): {
      const hasModalQuery = action.payload.query[modalQueryParameterName] === modalUrlName;
      const summaryShouldBeOpen = hasModalQuery
        && (action.payload.action === 'PUSH' || action.payload.action === 'REPLACE');
      const {colors, locationIds} = getFiltersFromQuery(action.payload.query);

      return {
        ...state,
        summary: {
          ...state.summary,
          filters: {...state.summary.filters, colors, locationIds},
          loading: hasModalQuery,
          open: summaryShouldBeOpen,
          pagination: hasModalQuery ? null : state.summary.pagination,
          studyGuides: hasModalQuery ? {} : state.summary.studyGuides,
        },
      };
    }
    case getType(receiveFeatureFlags):
      return {...state, isEnabled: action.payload.includes(studyGuidesFeatureFlag)};
    case getType(actions.openStudyGuides):
      return {...state, summary: {...state.summary, open: true}};
    case getType(actions.closeStudyGuides):
      return {...state, summary: {...state.summary, open: false}};
    case getType(actions.toggleStudyGuidesSummaryLoading):
      return {...state, summary: {...state.summary, loading: action.payload}};
    case getType(actions.printStudyGuides):
    case getType(actions.loadMoreStudyGuides):
      return {...state, summary: {...state.summary, loading: true}};
    case getType(actions.setSummaryFilters): {
      return {
        ...state,
        summary: {
          ...state.summary,
          filters: {...state.summary.filters, ...action.payload},
          loading: true,
          pagination: null,
          studyGuides: {},
        },
      };
    }
    case getType(actions.receiveStudyGuidesTotalCounts):
      return {
        ...state,
        summary: {
          ...state.summary,
          totalCountsPerPage: action.payload,
        },
      };
    case getType(actions.receiveSummaryStudyGuides): {
      // Check if filters wasn't updated while we were loading response.
      // It may happen if user with slow network connection change filters very fast.
      if (action.meta.filters && state.summary.filters !== action.meta.filters) { return state; }

      return {
        ...state,
        summary: {
          ...state.summary,
          loading: Boolean(action.meta.isStillLoading),
          pagination: action.meta.pagination,
          studyGuides: merge(state.summary.studyGuides || {}, action.payload),
        },
      };
    }
    default:
      return state;
  }
};

export default reducer;
