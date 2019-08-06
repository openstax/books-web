import { createStandardAction } from 'typesafe-actions';
import { State } from './types';

export const receiveSearchResults = createStandardAction('Content/Search/receiveResults')<
  Exclude<State['results'], null>
>();
export const requestSearch = createStandardAction('Content/Search/request')<string>();
export const clearSearch = createStandardAction('Content/Search/clear')();
