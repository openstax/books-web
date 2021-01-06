import { Highlight, HighlightColorEnum, HighlightsSummary, NewHighlight } from '@openstax/highlighter/dist/api';
import { ScrollTarget } from '../../navigation/types';
import { LinkedArchiveTree, LinkedArchiveTreeNode, LinkedArchiveTreeSection } from '../types';

export interface SummaryHighlights {
  [locationId: string]: {[pageId: string]: HighlightData[]};
}

export type OrderedSummaryHighlights = Array<{
  location: LinkedArchiveTreeNode,
  pages: Array<{
    pageId: string;
    highlights: HighlightData[];
  }>
}>;

export interface SummaryFilters {
  locationIds: string[];
  colors: HighlightColorEnum[];
}

export type CountsPerSource = NonNullable<HighlightsSummary['countsPerSource']>;
export type HighlightColorCounts = CountsPerSource[string];

export type SummaryHighlightsPagination = null | {
  sourceIds: string[];
  page: number;
  perPage: number;
};

export interface State {
  currentPage: {
    pageId: string | null,
    highlights: null | HighlightData[];
    hasUnsavedHighlight: boolean;
    focused?: string;
  };
  summary: {
    open: boolean,
    pagination: SummaryHighlightsPagination,
    totalCountsPerPage: CountsPerSource | null;
    filters: SummaryFilters,
    loading: boolean;
    highlights: SummaryHighlights | null;
  };
}

export type HighlightLocationFilters = Map<string, LinkedArchiveTree | LinkedArchiveTreeSection>;

export interface HighlightScrollTarget extends ScrollTarget {
  type: 'highlight';
  id: string;
}

// technically the null id is allowed by the api and it will create it if not supplied,
// but the scopeId should not be nullable in the swagger
export type NewHighlightPayload = NewHighlight & {id: string, scopeId: string};
export type HighlightData = Highlight & {scopeId: string};
