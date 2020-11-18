import { Highlight, HighlightColorEnum, HighlightsSummary } from '@openstax/highlighter/dist/api';
import { ScrollTarget } from '../../navigation/types';
import { LocationFilters } from '../components/popUp/ChapterFilter';
import { LinkedArchiveTreeNode } from '../types';

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

export type HighlightLocationFilters = LocationFilters;

export interface HighlightScrollTarget extends ScrollTarget {
  type: 'highlight';
  id: string;
}
