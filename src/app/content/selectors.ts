import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.content
);

export const tocOpen = createSelector(
  localState,
  (state) => state.tocOpen
);

export const book = createSelector(
  localState,
  (state) => state.book
);

export const contentReferences = createSelector(
  localState,
  (state) => state.references
);

export const page = createSelector(
  localState,
  (state) => state.page
);

export const loading = createSelector(
  localState,
  (state) => state.loading
);

export const loadingBook = createSelector(
  loading,
  (ids) => ids.book
);

export const loadingPage = createSelector(
  loading,
  (ids) => ids.page
);

export const bookAndPage = createSelector(
  book,
  page,
  (selectedBook, selectedPage) => ({book: selectedBook, page: selectedPage})
);
