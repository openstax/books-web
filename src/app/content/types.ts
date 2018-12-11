import { RouteParams, RouteState } from '../navigation/types';
import { content } from './routes';

export interface Params {
  bookId: string;
  pageId: string;
}

export interface State {
  tocOpen: boolean;
  params?: Params;
  loading: {
    book?: string;
    page?: string;
  };
  book?: Book;
  page?: Page;
  references: Array<PageReference & {match: string}>;
}

export interface PageReference {
  state: RouteState<typeof content>;
  params: RouteParams<typeof content>;
}

export interface Book {
  id: string;
  shortId: string;
  title: string;
  version: string;
  tree: ArchiveTree;
}

export interface Page {
  id: string;
  shortId: string;
  title: string;
  version: string;
}

export interface ArchiveTreeSection {
  id: string;
  shortId: string;
  title: string;
}

export interface ArchiveTree extends ArchiveTreeSection {
  contents: Array<ArchiveTree | ArchiveTreeSection>;
}

export interface ArchiveBook {
  id: string;
  shortId: string;
  tree: ArchiveTree;
  version: string;
  title: string;
}

export interface ArchivePage {
  id: string;
  shortId: string;
  content: string;
  version: string;
  title: string;
}

export type ArchiveContent = ArchivePage | ArchiveBook;
