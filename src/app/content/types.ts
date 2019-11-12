import { RouteParams, RouteState } from '../navigation/types';
import { State as HighlightState } from './highlights/types';
import { content } from './routes';
import { State as SearchState } from './search/types';

export interface Params {
  book: string;
  page: string;
  version?: string;
}

export interface State {
  tocOpen: boolean | null;
  params: Partial<Params>;
  loading: {
    book?: string;
    page?: string;
  };
  search: SearchState;
  highlights: HighlightState;
  book?: Book;
  page?: Page;
  references: PageReferenceMap[];
}

export interface PageReferenceMap extends PageReference {
  match: string;
}

export interface PageReference {
  state: RouteState<typeof content>;
  params: RouteParams<typeof content>;
}

export interface Book {
  id: string;
  shortId: string;
  title: string;
  theme: 'blue' | 'green' | 'gray' | 'yellow' | 'deep-green' | 'light-blue' | 'orange' | 'red';
  tree: ArchiveTree;
  version: string;
  slug: string;
  license: {
    name: string;
    version: string;
  };
  publish_date: string;
  authors: Array<{
    value: {
      name: string;
      senior_author: boolean;
    }
  }>;
}

export interface Page {
  abstract: string;
  id: string;
  shortId: string;
  title: string;
  version: string;
}

export interface ArchiveTreeNode {
  id: string;
  shortId: string;
  title: string;
  slug: string;
}

export type ArchiveTreeSection = ArchiveTreeNode;

export interface LinkedArchiveTree extends ArchiveTree {
  parent?: LinkedArchiveTree;
}

export interface LinkedArchiveTreeSection extends ArchiveTreeSection {
  parent: LinkedArchiveTree;
}

export type LinkedArchiveTreeNode = LinkedArchiveTreeSection | LinkedArchiveTree;

export interface ArchiveTree extends ArchiveTreeSection {
  contents: Array<ArchiveTree | ArchiveTreeSection>;
}

export interface ArchiveBook {
  id: string;
  shortId: string;
  title: string;
  tree: ArchiveTree;
  version: string;
  license: {
    name: string;
    version: string;
  };
}

export interface ArchivePage {
  abstract: string;
  id: string;
  shortId: string;
  content: string;
  version: string;
  title: string;
  revised: string;
}

export type ArchiveContent = ArchivePage | ArchiveBook;
