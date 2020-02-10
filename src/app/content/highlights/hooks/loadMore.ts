import { GetHighlightsColorsEnum, Highlight } from '@openstax/highlighter/dist/api';
import omit from 'lodash/fp/omit';
import { ActionHookBody, AppServices, AppState, MiddlewareAPI, Store } from '../../../types';
import { actionHook } from '../../../utils';
import { book as bookSelector } from '../../selectors';
import { loadMoreSummaryHighlights, receiveSummaryHighlights, setSummaryFilters } from '../actions';
import { summaryPageSize } from '../constants';
import * as select from '../selectors';
import { SummaryHighlightsPagination } from '../types';
import { getNextPageSources } from '../utils/paginationUtils';
import { fetchHighlightsForSource, formatReceivedHighlights, incrementPage } from './utils';

const getNewSources = (state: AppState, omitSources: string[]) => {
  const book = bookSelector(state);
  const remainingCounts = omit(omitSources, select.filteredCountsPerPage(state));
  return book ? getNextPageSources(remainingCounts, book.tree, summaryPageSize) : [];
};

const loadUntilPageSize = async({
  previousPagination,
  ...args
}: {
  previousPagination: SummaryHighlightsPagination,
  getState: Store['getState'],
  highlightClient: AppServices['highlightClient'],
  highlights?: Highlight[]
  sourcesFetched: string[]
}): Promise<{pagination: SummaryHighlightsPagination, highlights: Highlight[]}> => {
  const state = args.getState();
  const book = bookSelector(state);
  const {colors} = select.summaryFilters(state);
  const {page, sourceIds} = previousPagination
    ? incrementPage(previousPagination)
    : {sourceIds: getNewSources(state, args.sourcesFetched), page: 1};

  if (!book || sourceIds.length === 0) {
    return {pagination: null, highlights: args.highlights || []};
  }

  const {highlights, pagination} = await fetchHighlightsForSource({
    book,
    colors: colors as unknown as GetHighlightsColorsEnum[],
    highlightClient: args.highlightClient,
    pagination: {page, sourceIds},
    perFetch: summaryPageSize,
    prevHighlights: args.highlights,
  });

  if (highlights.length < summaryPageSize) {
    return loadUntilPageSize({
      ...args,
      highlights,
      previousPagination: pagination,
      sourcesFetched: [...args.sourcesFetched, ...sourceIds],
    });
  }

  return {pagination, highlights};
};

const loadMore = async({getState, highlightClient, dispatch}: MiddlewareAPI & AppServices) => {
  const state = getState();
  const locationFilters = select.highlightLocationFilters(state);
  const previousPagination = select.summaryPagination(state);
  const sourcesFetched = Object.keys(select.loadedCountsPerSource(state));

  const {pagination, highlights} = await loadUntilPageSize({
    getState,
    highlightClient,
    previousPagination,
    sourcesFetched,
  });

  const formattedHighlights = formatReceivedHighlights(highlights, locationFilters);

  dispatch(receiveSummaryHighlights(formattedHighlights, pagination));
};

export default loadMore;

export const hookBody: ActionHookBody<typeof setSummaryFilters | typeof loadMoreSummaryHighlights> =
  (services) => () => loadMore(services);

export const loadMoreHook = actionHook(loadMoreSummaryHighlights, hookBody);
export const setSummaryFiltersHook = actionHook(setSummaryFilters, hookBody);
