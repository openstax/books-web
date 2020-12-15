import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';
import { defaultTheme } from './components/constants';
import { hasOSWebData } from './guards';
import { getIdFromPageParam } from './utils';
import {
  findArchiveTreeNodeByPageParam,
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

export const buyPrintConfig = createSelector(
  localState,
  (state) => state.buyPrint
);

export const bookTheme = createSelector(
  book,
  (currentBook) => hasOSWebData(currentBook) ? currentBook.theme : defaultTheme
);

export const showNudgeStudyTools = createSelector(
  localState,
  (state) => state.showNudgeStudyTools
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

export const loadingPage = createSelector(
  loading,
  (slugs) => slugs.page
);

export const contentParams = createSelector(
  localState,
  (state) => state.params
);

export const pageParam = createSelector(
  contentParams,
  (params) => params ? params.page : null
);

export const pageNotFound = createSelector(
  localState,
  pageParam,
  (state, param) => getIdFromPageParam(param) === state.pageNotFoundId
);

export const pageNode = createSelector(
  book,
  pageParam,
  (selectedBook, selectedPageParam) => selectedBook && selectedPageParam
    ? findArchiveTreeNodeByPageParam(selectedBook.tree, selectedPageParam)
    : undefined
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
