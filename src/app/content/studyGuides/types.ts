import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import {
  CountsPerSource,
  SummaryHighlights,
  SummaryHighlightsPagination,
} from '../highlights/types';

export interface StudyGuidesSummaryFilters {
  colors: HighlightColorEnum[];
  locationIds: string[];
}

export interface State {
  isEnabled: boolean;
  summary: {
    filters: StudyGuidesSummaryFilters,
    loading: boolean,
    open: boolean,
    pagination: SummaryHighlightsPagination,
    studyGuides: SummaryHighlights | null
    totalCountsPerPage: CountsPerSource | null;
  };
}
