import flow from 'lodash/fp/flow';
import mapValues from 'lodash/fp/mapValues';
import merge from 'lodash/fp/merge';
import omit from 'lodash/fp/omit';
import reduce from 'lodash/fp/reduce';
import size from 'lodash/fp/size';
import values from 'lodash/fp/values';
import { createSelector } from 'reselect';
import { assertDefined } from '../../utils';
import * as parentSelectors from '../selectors';
import { enabledForBooks } from './constants';
import { HighlightLocationFilters } from './types';
import { getHighlightLocationFilters, getHighlightLocationFiltersWithContent } from './utils';
import { filterCountsPerSourceByChapters } from './utils/paginationUtils';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.highlights
);

export const isEnabled = createSelector(
  localState,
  parentSelectors.book,
  (state, book) => !!state.enabled && !!book && enabledForBooks.includes(book.id)
);

export const highlightsLoaded = createSelector(
  localState,
  (state) => state.highlights !== null
);

export const highlights = createSelector(
  localState,
  (state) => state.highlights || []
);

export const totalCountsPerPage = createSelector(
  localState,
  (state) => state.summary.totalCountsPerPage
);

export const focused = createSelector(
  localState,
  (state) => state.focused
);

export const myHighlightsOpen = createSelector(
  localState,
  (state) => state.myHighlightsOpen
);

export const summaryIsLoading = createSelector(
  localState,
  (state) => state.summary.loading
);

export const summaryFilters = createSelector(
  localState,
  (state) => state.summary.filters
);

export const summaryLocationFilters = createSelector(
  summaryFilters,
  (filters) => filters.locationIds
);

export const summaryHighlights = createSelector(
  localState,
  (state) => state.summary.highlights
);

export const highlightLocationFilters = createSelector(
  parentSelectors.book,
 (book) => book
  ? getHighlightLocationFilters(book)
  : new Map() as HighlightLocationFilters
);

export const highlightLocationFiltersWithContent = createSelector(
  highlightLocationFilters,
  totalCountsPerPage,
  (locationFilters, totalCounts) => getHighlightLocationFiltersWithContent(locationFilters, totalCounts || {})
);

const loadedCountsPerSource = createSelector(
  summaryHighlights,
  flow(
    values,
    reduce(merge, {}),
    mapValues(size)
  )
);

const selectedHighlightLocationFilters = createSelector(
  highlightLocationFilters,
  summaryLocationFilters,
 (locationFilters, selectedIds) => selectedIds.reduce((result, selectedId) =>
   result.set(selectedId, assertDefined(locationFilters.get(selectedId), 'location filter id not found'))
 , new Map() as HighlightLocationFilters)
);

// TODO - filter this by color when available from api
const filteredCountsPerPage = createSelector(
  totalCountsPerPage,
  selectedHighlightLocationFilters,
  (totalCounts, locationFilters) => filterCountsPerSourceByChapters(locationFilters, totalCounts || {})
);

export const remainingSourceCounts = createSelector(
  loadedCountsPerSource,
  filteredCountsPerPage,
  (loadedCounts, totalCounts) => omit(Object.keys(loadedCounts), totalCounts)
);
