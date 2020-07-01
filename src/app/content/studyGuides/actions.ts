import { createStandardAction } from 'typesafe-actions';
import {
  CountsPerSource,
  SummaryFilters,
  SummaryHighlights,
  SummaryHighlightsPagination
} from '../highlights/types';

export const receiveSummaryStudyGuides = createStandardAction(
  'Content/StudyGuides/Summary/receive'
)<
SummaryHighlights,
  {
    pagination: SummaryHighlightsPagination,
    isStillLoading?: boolean
  }
>();

export const openStudyGuides = createStandardAction('Content/StudyGuides/Summary/open')<void>();
export const closeStudyGuides = createStandardAction('Content/StudyGuides/Summary/close')<void>();
export const loadMoreStudyGuides = createStandardAction('Content/StudyGuides/loadMore')();
export const setDefaultSummaryFilters = createStandardAction('Content/StudyGuides/Summary/setDefaultFilters')<
  Partial<SummaryFilters>
>();
export const setSummaryFilters = createStandardAction('Content/StudyGuides/Summary/setFilters')<
  Partial<SummaryFilters>
>();
export const receiveStudyGuidesTotalCounts = createStandardAction(
  'Content/StudyGuides/receiveTotalCounts'
)<CountsPerSource>();
