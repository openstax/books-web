import { createStandardAction } from 'typesafe-actions';
import {
  CountsPerSource,
  SummaryFilters,
  SummaryFiltersUpdate,
  SummaryHighlights,
  SummaryHighlightsPagination
} from '../highlights/types';
import { StudyGuidesSummaryFilters } from './types';

export const receiveSummaryStudyGuides = createStandardAction(
  'Content/StudyGuides/Summary/receive'
)<
SummaryHighlights,
  {
    pagination: SummaryHighlightsPagination,
    filters?: StudyGuidesSummaryFilters,
    isStillLoading?: boolean
  }
>();

export const openStudyGuides = createStandardAction('Content/StudyGuides/Summary/open')<void>();
export const closeStudyGuides = createStandardAction('Content/StudyGuides/Summary/close')<void>();
export const loadMoreStudyGuides = createStandardAction('Content/StudyGuides/loadMore')();
export const printStudyGuides = createStandardAction('Content/StudyGuides/print')<void>();
export const setDefaultSummaryFilters = createStandardAction('Content/StudyGuides/Summary/setDefaultFilters')<
  SummaryFilters
>();
export const setSummaryFilters = createStandardAction('Content/StudyGuides/Summary/setFilters')<
  Partial<SummaryFilters>
>();
export const updateSummaryFilters = createStandardAction('Content/StudyGuides/Summary/updateFilters')<
  SummaryFiltersUpdate
>();
export const toggleStudyGuidesSummaryLoading = createStandardAction('Content/StudyGuides/Summary/loading')<boolean>();
export const receiveStudyGuidesTotalCounts = createStandardAction(
  'Content/StudyGuides/receiveTotalCounts'
)<CountsPerSource>();
