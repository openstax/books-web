import { isObject } from 'lodash/fp';
import { Key, Token } from 'path-to-regexp';
import {
  ArchiveTree,
  ArchiveTreeSection,
  Book,
  BookWithOSWebData,
  LinkedArchiveTree,
  LinkedArchiveTreeSection
} from './types';

export const isArchiveTree = (section: ArchiveTree | ArchiveTreeSection): section is ArchiveTree =>
  (section as ArchiveTree).contents !== undefined;
export const isLinkedArchiveTree =
  (section: LinkedArchiveTree | LinkedArchiveTreeSection): section is LinkedArchiveTree =>
    (section as LinkedArchiveTree).contents !== undefined;
export const isLinkedArchiveTreeSection =
  (section: LinkedArchiveTree | LinkedArchiveTreeSection): section is LinkedArchiveTreeSection =>
    (section as LinkedArchiveTree).contents === undefined && section.parent !== undefined;

export const hasOSWebData = (book: Book | undefined): book is BookWithOSWebData =>
  book ? 'slug' in book : false;

export const pathTokenIsKey = (token: Token): token is Key =>
  isObject(token);
