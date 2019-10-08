import { SearchResult } from '@openstax/open-search-client';
import { SearchResultHit } from '@openstax/open-search-client/dist/models/SearchResultHit';
import { ArchiveTree, ArchiveTreeSection } from '../types';

export interface State {
  loading: boolean;
  mobileToolbarOpen: boolean;
  query: null | string;
  results: SearchResult | null;
  selectedResult: SelectedResult | null;
  sidebarOpen: boolean;
}

export interface SelectedResult {
  result: SearchResultHit;
  highlight: number;
}

export type SearchResultPage = ArchiveTreeSection & {
  results: SearchResultHit[];
};

export type SearchResultChapter = ArchiveTree & {
  contents: Array<SearchResultChapter | SearchResultPage>;
};

export type SearchResultContainer = SearchResultPage | SearchResultChapter;
