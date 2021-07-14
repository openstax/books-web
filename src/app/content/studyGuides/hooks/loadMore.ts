import {
  GetHighlightsColorsEnum, GetHighlightsSetsEnum,
} from '@openstax/highlighter/dist/api';
import { ensureApplicationErrorType } from '../../../../helpers/applicationMessageError';
import { locationChange } from '../../../navigation/actions';
import { ActionHookBody, AppServices, MiddlewareAPI, Unpromisify } from '../../../types';
import { actionHook } from '../../../utils';
import { summaryPageSize } from '../../constants';
import { StudyGuidesPopupLoadError } from '../../highlights/errors';
import { formatReceivedHighlights, loadUntilPageSize } from '../../highlights/utils/highlightLoadingUtils';
import { book as bookSelector, bookAndPage } from '../../selectors';
import * as actions from '../actions';
import * as select from '../selectors';

export const loadMore = async(services: MiddlewareAPI & AppServices, pageSize?: number) => {
  const state = services.getState();

  const locationFilters = select.studyGuidesLocationFilters(state);
  const colorFilters = select.summaryColorFilters(state);
  const sourcesFetched = Object.keys(select.loadedCountsPerSource(state));
  const filteredCounts = select.filteredCountsPerPage(state);
  const previousPagination = select.summaryStudyGuidesPagination(state);
  const book = bookSelector(state);

  const {highlights, pagination} = await loadUntilPageSize({
    book,
    colors: [...colorFilters] as unknown as GetHighlightsColorsEnum[],
    countsPerSource: filteredCounts,
    highlightClient: services.highlightClient,
    pageSize,
    previousPagination,
    sets: [GetHighlightsSetsEnum.Curatedopenstax],
    sourcesFetched,
  });

  return {
    formattedHighlights: formatReceivedHighlights(highlights, locationFilters),
    pagination,
  };
};
export type LoadMoreResponse = ReturnType<typeof loadMore>;

export const hookBody: ActionHookBody<
  typeof locationChange |
  typeof actions.setSummaryFilters |
  typeof actions.loadMoreStudyGuides
> = (services) => async() => {
  const {book, page} = bookAndPage(services.getState());

  if (!book || !page) { return; }

  const filters = select.summaryFilters(services.getState());

  let response: Unpromisify<LoadMoreResponse>;

  try {
    response = await loadMore(services, summaryPageSize);
  } catch (error) {
    services.dispatch(actions.toggleStudyGuidesSummaryLoading(false));
    throw ensureApplicationErrorType(error, new StudyGuidesPopupLoadError({ destination: 'studyGuides' }));
  }

  const {formattedHighlights, pagination} = response;
  services.dispatch(actions.receiveSummaryStudyGuides(formattedHighlights, {pagination, filters}));
};

export const locationChangeHook = actionHook(locationChange, hookBody);
export const loadMoreHook = actionHook(actions.loadMoreStudyGuides, hookBody);
export const setSummaryFiltersHook = actionHook(actions.setSummaryFilters, hookBody);
