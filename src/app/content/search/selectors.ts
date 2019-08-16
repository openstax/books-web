import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';
import { getFormattedSearchResults } from './utils';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.search
);

export const searchResultsOpen = createSelector(
  localState,
  (state) => !!state.query
);

export const query = createSelector(
  localState,
  (state) => state.query
);

export const totalHits = createSelector(
  localState,
  (state) => !!state.results ? state.results.hits.total : null
);

export const results = createSelector(
  localState,
  parentSelectors.book,
  (state, book) => !!state.results && !!book ? getFormattedSearchResults(book.tree, state.results) : null
);

export const mobileOpen = createSelector(
  localState,
  (state) => state.mobileOpen
);
