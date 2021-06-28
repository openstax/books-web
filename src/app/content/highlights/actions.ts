import { Highlight, NewHighlight, UpdateHighlightRequest } from '@openstax/highlighter/dist/api';
import { createStandardAction } from 'typesafe-actions';
import { LocationFilters } from '../components/popUp/types';
import {
  CountsPerSource,
  HighlightData,
  SummaryFilters,
  SummaryFiltersUpdate,
  SummaryHighlights,
  SummaryHighlightsPagination,
} from './types';

export const focusHighlight = createStandardAction('Content/Highlights/focus')<string>();
export const clearFocusedHighlight = createStandardAction('Content/Highlights/clear')();
export const setForceScrollToHiglight = createStandardAction('Content/Highlights/setForceScrollToHiglight')<boolean>();

export const createHighlight = createStandardAction('Content/Highlights/create')<NewHighlight, {
  revertingAfterFailure?: boolean,
  locationFilterId: string,
  pageId: string,
}>();
export const requestDeleteHighlight = createStandardAction('Content/Highlights/requestDelete')<Highlight, {
  locationFilterId: string,
  pageId: string,
}>();
export const receiveDeleteHighlight = createStandardAction('Content/Highlights/receiveDelete')<Highlight, {
  revertingAfterFailure?: boolean,
  locationFilterId: string,
  pageId: string,
}>();
export const updateHighlight = createStandardAction('Content/Highlights/update')<UpdateHighlightRequest, {
  revertingAfterFailure?: boolean,
  preUpdateData: UpdateHighlightRequest,
  locationFilterId: string,
  pageId: string,
}>();
export const receiveHighlights = createStandardAction(
  'Content/Highlights/receive'
)<{highlights: HighlightData[], pageId: string}>();
export const setAnnotationChangesPending = createStandardAction('Content/Highlights/setAnnotationChangesPending')<
  boolean
>();

export const openMyHighlights = createStandardAction('Content/Highlights/Summary/open')<void>();
export const closeMyHighlights = createStandardAction('Content/Highlights/Summary/close')<void>();
export const initializeMyHighlightsSummary = createStandardAction('Content/Highlights/Summary/init')<void>();

export const printSummaryHighlights = createStandardAction('Content/Highlights/Summary/print')();
export const toggleSummaryHighlightsLoading = createStandardAction('Content/Highlights/Summary/loading')<boolean>();

export const loadMoreSummaryHighlights = createStandardAction('Content/Highlights/Summary/loadMore')();
export const setSummaryFilters = createStandardAction('Content/Highlights/Summary/setFilters')<
  Partial<SummaryFilters>
>();
export const updateSummaryFilters = createStandardAction('Content/Highlights/Summary/updateFilters')<
  Partial<SummaryFiltersUpdate>
>();
export const receiveSummaryHighlights = createStandardAction('Content/Highlights/Summary/receiveHighlights')<
  SummaryHighlights,
  {
    pagination: SummaryHighlightsPagination,
    filters?: SummaryFilters,
    isStillLoading?: boolean
  }
>();
export const receiveHighlightsTotalCounts = createStandardAction(
  'Content/receiveHighlightsTotalCounts'
)<CountsPerSource, LocationFilters>();
