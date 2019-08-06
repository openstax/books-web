import { isArchiveTree } from '../guards';
import { SearchResultChapter, SearchResultContainer } from './types';

export const isSearchResultChapter = (container: SearchResultContainer): container is SearchResultChapter =>
  isArchiveTree(container);
