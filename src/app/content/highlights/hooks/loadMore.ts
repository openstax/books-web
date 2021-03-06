import { GetHighlightsColorsEnum } from '@openstax/highlighter/dist/api';
import { ensureApplicationErrorType } from '../../../../helpers/applicationMessageError';
import { ActionHookBody, AppServices, MiddlewareAPI, Unpromisify } from '../../../types';
import { actionHook } from '../../../utils';
import { summaryPageSize } from '../../constants';
import { book as bookSelector } from '../../selectors';
import {
  loadMoreSummaryHighlights,
  receiveSummaryHighlights,
  setSummaryFilters,
  toggleSummaryHighlightsLoading,
  updateSummaryFilters
} from '../actions';
import { HighlightPopupLoadError } from '../errors';
import * as select from '../selectors';
import { formatReceivedHighlights, loadUntilPageSize } from '../utils/highlightLoadingUtils';

export const loadMore = async(services: MiddlewareAPI & AppServices, pageSize?: number) => {
  const state = services.getState();

  const locationFilters = select.highlightLocationFilters(state);
  const book = bookSelector(state);
  const previousPagination = select.summaryPagination(state);
  const sourcesFetched = Object.keys(select.loadedCountsPerSource(state));
  const colors = select.summaryColorFilters(state);
  const filteredCounts = select.filteredCountsPerPage(state);

  const { highlights, pagination } = await loadUntilPageSize({
    book,
    colors: [...colors] as unknown as GetHighlightsColorsEnum[],
    countsPerSource: filteredCounts,
    highlightClient: services.highlightClient,
    pageSize,
    previousPagination,
    sourcesFetched,
  });

  return {
    formattedHighlights: formatReceivedHighlights(highlights, locationFilters),
    pagination,
  };
};
export type LoadMoreResponse = ReturnType<typeof loadMore>;

export const hookBody: ActionHookBody<
  typeof setSummaryFilters |
  typeof loadMoreSummaryHighlights |
  typeof updateSummaryFilters
> =
  (services) => async() => {
    const filters = select.summaryFilters(services.getState());

    let highlights: Unpromisify<LoadMoreResponse>;

    try {
      highlights = await loadMore(services, summaryPageSize);
    } catch (error) {
      services.dispatch(toggleSummaryHighlightsLoading(false));
      throw ensureApplicationErrorType(error, new HighlightPopupLoadError({ destination: 'myHighlights' }));
    }

    const {formattedHighlights, pagination} = highlights;
    services.dispatch(receiveSummaryHighlights(formattedHighlights, {pagination, filters}));
  };

export const loadMoreHook = actionHook(loadMoreSummaryHighlights, hookBody);
export const setSummaryFiltersHook = actionHook(setSummaryFilters, hookBody);
export const updateFiltersHook = actionHook(updateSummaryFilters, hookBody);
