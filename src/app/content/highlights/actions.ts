import { NewHighlight, UpdateHighlightRequest } from '@openstax/highlighter/dist/api';
import { createStandardAction } from 'typesafe-actions';
import {
  CountsPerSource,
  HighlightData,
  HighlightLocationFilters,
  SummaryFilters,
  SummaryHighlights,
  SummaryHighlightsPagination,
} from './types';

export const focusHighlight = createStandardAction('Content/Highlights/focus')<string>();
export const clearFocusedHighlight = createStandardAction('Content/Highlights/clear')();
export const createHighlight = createStandardAction('Content/Highlights/create')<NewHighlight & {id: string}, {
  locationFilterId: string,
  pageId: string,
}>();
export const deleteHighlight = createStandardAction('Content/Highlights/delete')<string, {
  locationFilterId: string,
  pageId: string,
}>();
export const updateHighlight = createStandardAction('Content/Highlights/update')<UpdateHighlightRequest, {
  locationFilterId: string,
  pageId: string,
}>();
export const receiveHighlights = createStandardAction('Content/Highlights/receive')<HighlightData[]>();

export const openMyHighlights = createStandardAction('Content/Highlights/Summary/open')<void>();
export const closeMyHighlights = createStandardAction('Content/Highlights/Summary/close')<void>();
export const initializeMyHighlightsSummary = createStandardAction('Content/Highlights/Summary/init')<void>();

export const printSummaryHighlights = createStandardAction('Content/Highlights/Summary/print')();
export const toggleSummaryHighlightsLoading = createStandardAction('Content/Highlights/Summary/loading')<boolean>();

export const loadMoreSummaryHighlights = createStandardAction('Content/Highlights/Summary/loadMore')();
export const setSummaryFilters = createStandardAction('Content/Highlights/Summary/setFilters')<
  Partial<SummaryFilters>
>();
export const receiveSummaryHighlights = createStandardAction('Content/Highlights/Summary/receiveHighlights')<
  SummaryHighlights,
  {
    pagination: SummaryHighlightsPagination,
    isStillLoading?: boolean
  }
>();
export const receiveHighlightsTotalCounts = createStandardAction(
  'Content/receiveHighlightsTotalCounts'
)<CountsPerSource, HighlightLocationFilters>();
