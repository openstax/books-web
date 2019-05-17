import { RouteParams, RouteState } from '../navigation/types';
import { content } from './routes';

export interface Params {
  book: string;
  page: string;
}

export interface State {
  tocOpen: boolean | null;
  params?: Params;
  loading: {
    book?: string;
    page?: string;
  };
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
  theme: 'blue' | 'green' | 'gray' | 'yellow';
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
    }
  }>;
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
  slug: string;
}

export interface LinkedArchiveTree extends ArchiveTree {
  parent?: LinkedArchiveTree;
}

export interface LinkedArchiveTreeSection extends ArchiveTreeSection {
  parent: LinkedArchiveTree;
}

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
  id: string;
  shortId: string;
  content: string;
  version: string;
  title: string;
}

export type ArchiveContent = ArchivePage | ArchiveBook;
