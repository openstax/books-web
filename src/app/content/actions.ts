import { createStandardAction } from 'typesafe-actions';
import * as searchActions from './search/actions';
import { ArchivePage, Book, State } from './types';

export const search = searchActions;

export const openToc = createStandardAction('Content/openToc')<void>();
export const closeToc = createStandardAction('Content/closeToc')<void>();
export const resetToc = createStandardAction('Content/resetToc')<void>();

export const requestBook = createStandardAction('Content/requestBook')<string>();
export const receiveBook = createStandardAction('Content/receiveBook')<Book>();

export const requestPage = createStandardAction('Content/requestPage')<string>();
export const receivePage = createStandardAction('Content/receivePage')<
  ArchivePage & {references: State['references']}
>();
