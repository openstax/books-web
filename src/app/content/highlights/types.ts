import { Highlight, HighlightColorEnum, HighlightsSummary } from '@openstax/highlighter/dist/api';
import { LinkedArchiveTree, LinkedArchiveTreeNode, LinkedArchiveTreeSection } from '../types';

export type HighlightData = Highlight;
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
  myHighlightsOpen: boolean;
  enabled: boolean;
  focused?: string;
  highlights: null | HighlightData[];
  summary: {
    pagination: SummaryHighlightsPagination,
    totalCountsPerPage: CountsPerSource | null;
    filters: SummaryFilters,
    loading: boolean;
    highlights: SummaryHighlights | null;
  };
}

export type HighlightLocationFilters = Map<string, LinkedArchiveTree | LinkedArchiveTreeSection>;
