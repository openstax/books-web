import { Highlight, HighlightColorEnum, HighlightSourceTypeEnum } from '@openstax/highlighter/dist/api';
import omit from 'lodash/fp/omit';
import pick from 'lodash/fp/pick';
import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { receiveLoggedOut } from '../../auth/actions';
import { locationChange } from '../../navigation/actions';
import { AnyAction } from '../../types';
import { merge } from '../../utils';
import { highlightStyles, modalQueryParameterName } from '../constants';
import * as actions from './actions';
import { modalUrlName } from './constants';
import { State } from './types';
import {
  addToTotalCounts,
  removeFromTotalCounts,
  removeSummaryHighlight,
  updateInTotalCounts,
  updateSummaryHighlightsDependOnFilters
} from './utils';
import { findHighlight } from './utils/reducerUtils';
import updateSummaryFilters from './utils/updateSummaryFilters';

const defaultColors = highlightStyles.map(({label}) => label);

export const initialState: State = {
  currentPage: {
    hasUnsavedHighlight: false,
    highlights: null,
    pageId: null,
    shouldForceScrollToHiglight: false,
  },
  summary: {
    filters: {colors: defaultColors, locationIds: []},
    highlights: null,
    loading: false,
    open: false,
    pagination: null,
    totalCountsPerPage: null,
  },
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(locationChange): {
      // Noops for locationChange dispatched when search query changes
      if (action.payload.action === 'REPLACE') { return state; }

      const summaryShouldBeOpen = action.payload.query[modalQueryParameterName] === modalUrlName
        && action.payload.action === 'PUSH';

      const currentPageId = state.currentPage.pageId;
      const actionPageId = action.payload.location.state && action.payload.location.state.pageUid;
      return {
        currentPage: currentPageId && actionPageId === currentPageId
          ? omit('focused', {...state.currentPage, hasUnsavedHighlight: false})
          : initialState.currentPage,
        summary: {
          ...state.summary,
          open: summaryShouldBeOpen,
        },
      };
    }
    case getType(actions.createHighlight): {
      const highlight = {
        ...action.payload,
        color: action.payload.color as string as HighlightColorEnum,
        sourceType: action.payload.sourceType as string as HighlightSourceTypeEnum,
      };

      const newSummaryHighlights = state.summary.highlights
        ? updateSummaryHighlightsDependOnFilters(
          state.summary.highlights,
          state.summary.filters,
          {...action.meta, highlight })
        : state.summary.highlights;

      const totalCountsPerPage = state.summary.totalCountsPerPage
        ? addToTotalCounts(state.summary.totalCountsPerPage, highlight)
        : state.summary.totalCountsPerPage;

      return {
        currentPage: {
          ...state.currentPage,
          hasUnsavedHighlight: false,
          highlights: [...state.currentPage.highlights || [], highlight],
        },
        summary: {
          ...state.summary,
          highlights: newSummaryHighlights || state.summary.highlights,
          totalCountsPerPage,
        },
      };
    }
    case getType(actions.openMyHighlights):
      return {...state, summary: { ...state.summary, open: true }};
    case getType(actions.closeMyHighlights):
      return {...state, summary: { ...state.summary, open: false }};
    case getType(actions.updateHighlight): {
      const oldHighlight = findHighlight(state, action.payload.id);
      const highlights = state.currentPage.highlights;

      if (!oldHighlight) {
        return state;
      }

      const hasUnsavedHighlight =
        oldHighlight.annotation === action.payload.highlight.annotation
        && state.currentPage.hasUnsavedHighlight;

      const newHighlight = {
        ...oldHighlight,
        ...action.payload.highlight,
      } as Highlight;

      const newCurrentPageHighlights = highlights
        ? highlights.map((highlight) => {
            if (highlight.id === oldHighlight.id) { return newHighlight; }
            return highlight;
          })
        : null;

      const newSummaryHighlights = state.summary.highlights
        ? updateSummaryHighlightsDependOnFilters(
          state.summary.highlights,
          state.summary.filters,
          {...action.meta, highlight: newHighlight})
        : state.summary.highlights
      ;

      const totalCountsPerPage = state.summary.totalCountsPerPage
        ? updateInTotalCounts(state.summary.totalCountsPerPage, oldHighlight, newHighlight)
        : state.summary.totalCountsPerPage
      ;

      return {
        currentPage: {
          ...state.currentPage,
          hasUnsavedHighlight,
          highlights: newCurrentPageHighlights,
        },
        summary: {
          ...state.summary,
          highlights: newSummaryHighlights,
          totalCountsPerPage,
        },
      };
    }
    case getType(actions.receiveDeleteHighlight): {
      const highlightToRemove = findHighlight(state, action.payload.id);
      const highlights = state.currentPage.highlights;

      if (!highlightToRemove) {
        return state;
      }

      const newCurrentPageHighlights = highlights
        ? highlights.filter(({id}) => id !== action.payload.id)
        : null;

      const newSummaryHighlights = state.summary.highlights
        ? removeSummaryHighlight(state.summary.highlights, {
          ...pick(['locationFilterId', 'pageId'], action.meta),
          id: action.payload.id,
        })
        : state.summary.highlights
      ;

      const totalCountsPerPage = state.summary.totalCountsPerPage && highlightToRemove
        ? removeFromTotalCounts(state.summary.totalCountsPerPage, highlightToRemove)
        : state.summary.totalCountsPerPage
      ;

      return {
        currentPage: {
          ...state.currentPage,
          focused: state.currentPage.focused === action.payload.id ? undefined : state.currentPage.focused,
          hasUnsavedHighlight: false,
          highlights: newCurrentPageHighlights,
        },
        summary: {
          ...state.summary,
          highlights: newSummaryHighlights,
          totalCountsPerPage,
        },
      };
    }
    case getType(actions.receiveHighlights): {
      return {
        currentPage: {
          ...state.currentPage,
          highlights: action.payload.highlights,
          pageId: action.payload.pageId,
        },
        summary: {...state.summary},
      };
    }
    case getType(actions.focusHighlight): {
      return {...state, currentPage: { ...state.currentPage, hasUnsavedHighlight: false, focused: action.payload }};
    }
    case getType(actions.clearFocusedHighlight): {
      return {...state, currentPage: omit('focused', {...state.currentPage, hasUnsavedHighlight: false})};
    }
    case getType(actions.setForceScrollToHiglight): {
      return {...state, currentPage: {...state.currentPage, shouldForceScrollToHiglight: action.payload}};
    }
    case getType(actions.setAnnotationChangesPending): {
      return {
        ...state,
        currentPage: {
          ...state.currentPage,
          hasUnsavedHighlight: action.payload,
        },
      };
    }
    case getType(actions.printSummaryHighlights): {
      return {
        ...state,
        summary: {
          ...state.summary,
          loading: true,
        },
      };
    }
    case getType(actions.toggleSummaryHighlightsLoading): {
      return {
        ...state,
        summary: {
          ...state.summary,
          loading: action.payload,
        },
      };
    }
    case getType(actions.initializeMyHighlightsSummary):
    case getType(actions.loadMoreSummaryHighlights): {
      return {
        ...state,
        summary: {
          ...state.summary,
          loading: true,
        },
      };
    }
    case getType(actions.setSummaryFilters): {
      return {
        ...state,
        summary: {
          ...state.summary,
          filters: {
            ...state.summary.filters,
            ...action.payload,
          },
          highlights: {},
          loading: true,
          pagination: null,
        },
      };
    }
    case getType(actions.updateSummaryFilters): {
      return {
        ...state,
        summary: {
          ...state.summary,
          filters: updateSummaryFilters(state.summary.filters, action.payload),
          highlights: {},
          loading: true,
          pagination: null,
        },
      };
    }
    case getType(actions.receiveSummaryHighlights): {
      // Check if filters wasn't updated while we were loading response.
      // It may happen if user with slow network connection change filters very fast.
      if (action.meta.filters && state.summary.filters !== action.meta.filters) { return state; }

      return {
        ...state,
        summary: {
          ...state.summary,
          highlights: merge(state.summary.highlights || {}, action.payload),
          loading: Boolean(action.meta.isStillLoading),
          pagination: action.meta.pagination,
        },
      };
    }
    case getType(actions.receiveHighlightsTotalCounts): {
      const locationIds = Array.from(action.meta.keys());

      return {
        ...state,
        summary: {
          ...state.summary,
          filters: {
            ...state.summary.filters,
            locationIds,
          },
          totalCountsPerPage: action.payload,
        },
      };
    }
    case getType(receiveLoggedOut): {
      return initialState;
    }
    default:
      return state;
  }
};

export default reducer;
