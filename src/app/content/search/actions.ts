import { createAction, createStandardAction } from 'typesafe-actions';
import { SelectedResult, State } from './types';

export const receiveSearchResults = createAction('Content/Search/receiveResults', (action) =>
  (
    results: Exclude<State['results'], null>,
    meta?: {selectedResult?: SelectedResult | null}
  ) => action(results, meta)
);

export const requestSearch = createAction('Content/Search/request', (action) =>
  (
    query: string,
    meta?: {
      isResultReload: boolean,
      selectedResult?: SelectedResult | null,
    }
  ) => action(query, meta)
);

export const clearSearch = createStandardAction('Content/Search/clear')();
export const openMobileToolbar = createStandardAction('Content/Search/openMobileToolbar')();
export const openSearchResultsMobile = createStandardAction('Content/Search/open')();
export const closeSearchResultsMobile = createStandardAction('Content/Search/close')();

export const selectSearchResult = createStandardAction('Content/Search/selectResult')<SelectedResult>();
