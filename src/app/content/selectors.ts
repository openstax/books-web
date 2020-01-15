import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';
import {
  findArchiveTreeNodeBySlug,
  prevNextBookPage,
} from './utils/archiveTreeUtils';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.content
);

export const tocOpen = createSelector(
  localState,
  (state) => !state.search.query && state.tocOpen
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
  (slugs) => slugs.book
);

export const loadingUuid = createSelector(
  loading,
  (slugs) => slugs.uuid
);

export const loadingPage = createSelector(
  loading,
  (slugs) => slugs.page
);

export const pageParam = createSelector(
  localState,
  (state) => state.params ? state.params.page : null
);

export const pageNode = createSelector(
  book,
  pageParam,
  (selectedBook, slug) => selectedBook && slug ? findArchiveTreeNodeBySlug(selectedBook.tree, slug) : undefined
);

export const bookAndPage = createSelector(
  book,
  page,
  (selectedBook, selectedPage) => ({book: selectedBook, page: selectedPage})
);

export const prevNextPage = createSelector(
  book,
  page,
  (selectedBook, selectedPage) => selectedBook && selectedPage
    ? prevNextBookPage(selectedBook, selectedPage.id)
    : null
);
