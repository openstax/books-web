import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';
import {
  getHighlightColorFiltersWithContent,
  getHighlightLocationFilters,
  getHighlightLocationFiltersWithContent,
  getSortedSummaryHighlights,
  sectionIsHighlightLocationFitler
} from './utils';
import {
  checkIfHasMoreResults,
  filterCounts,
  getLoadedCountsPerSource,
  getSelectedHighlightsLocationFilters
} from './utils/selectorsUtils';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.highlights
);

export const highlightsLoaded = createSelector(
  localState,
  (state) => state.currentPage.highlights !== null
);

export const highlightsPageId = createSelector(
  localState,
  (state) => state.currentPage.pageId
);

export const highlights = createSelector(
  localState,
  (state) => state.currentPage.highlights || []
);

export const totalCountsPerPage = createSelector(
  localState,
  (state) => state.summary.totalCountsPerPage
);

const totalCountsPerPageOrEmpty = createSelector(
  totalCountsPerPage,
  (totalCounts) => totalCounts || {}
);

export const focused = createSelector(
  localState,
  (state) => state.currentPage.focused
);

export const shouldForceScrollToHiglight = createSelector(
  localState,
  (state) => state.currentPage.shouldForceScrollToHiglight
);

export const hasUnsavedHighlight = createSelector(
  localState,
  (state) => state.currentPage.hasUnsavedHighlight
);

export const myHighlightsOpen = createSelector(
  localState,
  (state) => state.summary.open
);

export const summaryIsLoading = createSelector(
  localState,
  (state) => state.summary.loading
);

export const summaryHighlights = createSelector(
  localState,
  (state) => state.summary.highlights
);

export const summaryPagination = createSelector(
  localState,
  (state) => state.summary.pagination
);

export const highlightLocationFilters = createSelector(
  parentSelectors.book,
  getHighlightLocationFilters(sectionIsHighlightLocationFitler)
);

export const orderedSummaryHighlights = createSelector(
  summaryHighlights,
  highlightLocationFilters,
  (highlightsToSort, locationFilters) => {
    return getSortedSummaryHighlights(highlightsToSort, locationFilters);
  }
);

export const highlightLocationFiltersWithContent = createSelector(
  highlightLocationFilters,
  totalCountsPerPageOrEmpty,
  (locationFilters, totalCounts) => getHighlightLocationFiltersWithContent(locationFilters, totalCounts)
);

export const highlightColorFiltersWithContent = createSelector(
  totalCountsPerPageOrEmpty,
  (totalCounts) => getHighlightColorFiltersWithContent(totalCounts)
);

export const loadedCountsPerSource = createSelector(
  summaryHighlights,
  getLoadedCountsPerSource
);

export const summaryFilters = createSelector(
  localState,
  (state) => state.summary.filters
);

const rawSummaryLocationFilters = createSelector(
  summaryFilters,
  (filters) => filters.locationIds
);

const rawSummaryColorFilters = createSelector(
  summaryFilters,
  (filters) => filters.colors
);

export const summaryLocationFilters = createSelector(
  rawSummaryLocationFilters,
  highlightLocationFiltersWithContent,
  (selectedLocations, withContent) =>
    new Set(selectedLocations.filter((locationId) => withContent.has(locationId)))
);

export const summaryColorFilters = createSelector(
  rawSummaryColorFilters,
  highlightColorFiltersWithContent,
  (selectedColors, withContent) =>
    new Set(selectedColors.filter((color) => withContent.has(color)))
);

const selectedHighlightLocationFilters = createSelector(
  highlightLocationFilters,
  summaryLocationFilters,
  getSelectedHighlightsLocationFilters
);

export const filteredCountsPerPage = createSelector(
  totalCountsPerPageOrEmpty,
  selectedHighlightLocationFilters,
  summaryColorFilters,
  filterCounts
);

export const hasMoreResults = createSelector(
  loadedCountsPerSource,
  filteredCountsPerPage,
  summaryPagination,
  checkIfHasMoreResults
);
