import { createAction, createStandardAction } from 'typesafe-actions';
import { State } from './types';

export const receiveSearchResults = createAction('Content/Search/receiveResults', (action) =>
  (results: Exclude<State['results'], null>, meta?: {skipNavigation: boolean}) => action(results, meta)
);

export const requestSearch = createAction('Content/Search/request', (action) =>
  (query: string, meta?: {skipNavigation: boolean}) => action(query, meta)
);

export const clearSearch = createStandardAction('Content/Search/clear')();
export const openSearchResultsMobile = createStandardAction('Content/Search/open')();
export const closeSearchResultsMobile = createStandardAction('Content/Search/close')();
export const setCurrentExcerpt = createStandardAction('Content/Search/excerpt')<string>();
