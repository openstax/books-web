import {
  GetHighlightsRequest,
  GetHighlightsSourceTypeEnum,
  Highlight,
  Highlights
} from '@openstax/highlighter/dist/api';
import omit from 'lodash/fp/omit';
import { AppServices, AppState } from '../../../types';
import { assertDefined } from '../../../utils';
import { book as bookSelector } from '../../selectors';
import { Book } from '../../types';
import { stripIdVersion } from '../../utils';
import * as select from '../selectors';
import { HighlightLocationFilters, SummaryHighlightsPagination, } from '../types';
import { addSummaryHighlight, getHighlightLocationFilterForPage } from '../utils';
import { getNextPageSources } from '../utils/paginationUtils';

export interface SummaryHighlightsQuery {
  colors: Exclude<GetHighlightsRequest['colors'], undefined>;
  sets: GetHighlightsRequest['sets'];
}

export const formatReceivedHighlights = (
  highlights: Highlight[],
  locationFilters: HighlightLocationFilters
) => highlights.reduce((result, highlight) => {
  const pageId = stripIdVersion(highlight.sourceId);
  const location = assertDefined(
    getHighlightLocationFilterForPage(locationFilters, pageId),
    'highlight is not in a valid location'
  );
  const locationFilterId = stripIdVersion(location.id);

  return addSummaryHighlight(result, {
    highlight,
    locationFilterId,
    pageId,
  });
}, {} as ReturnType<typeof addSummaryHighlight>);

export const incrementPage = (pagination: NonNullable<SummaryHighlightsPagination>) =>
  ({...pagination, page: pagination.page + 1});

export const getNewSources = (state: AppState, omitSources: string[], pageSize?: number) => {
  const book = bookSelector(state);
  const remainingCounts = omit(omitSources, select.filteredCountsPerPage(state));
  return book ? getNextPageSources(remainingCounts, book.tree, pageSize) : [];
};

export const extractDataFromHighlightClientResponse = (highlightsResponse: Highlights) => {
  // TODO - change swagger so none of this is nullable
  const data = assertDefined(highlightsResponse.data, 'response from highlights api is invalid');
  const meta = assertDefined(highlightsResponse.meta, 'response from highlights api is invalid');
  const page = assertDefined(meta.page, 'response from highlights api is invalid');
  const perPage = assertDefined(meta.perPage, 'response from highlights api is invalid');
  const totalCount = assertDefined(meta.totalCount, 'response from highlights api is invalid');

  return {
    data,
    meta,
    page,
    perPage,
    totalCount,
  };
};

export const fetchHighlightsForSource = async({
  highlightClient,
  prevHighlights,
  book,
  query,
  pagination,
}: {
  highlightClient: AppServices['highlightClient'],
  prevHighlights?: Highlight[],
  book: Book,
  pagination: NonNullable<SummaryHighlightsPagination>,
  query: SummaryHighlightsQuery
}) => {
  console.log({
    scopeId: book.id,
    sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
    ...pagination,
    ...query,
  })
  const highlightsResponse = await highlightClient.getHighlights({
    scopeId: book.id,
    sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
    ...pagination,
    ...query,
  });

  const {data, perPage, totalCount} = extractDataFromHighlightClientResponse(highlightsResponse);

  const loadedResults = (pagination.page - 1) * perPage + data.length;
  const nextPagination = loadedResults < totalCount
    ? pagination
    : null;

  return {
    highlights: prevHighlights ? [...prevHighlights, ...data] : data,
    pagination: nextPagination,
  };
};

export const loadUntilPageSize = async({
  previousPagination,
  ...args
}: {
  previousPagination: SummaryHighlightsPagination,
  getState: Store['getState'],
  highlightClient: AppServices['highlightClient'],
  highlights?: Highlight[]
  sourcesFetched: string[],
  pageSize?: number,
  query: SummaryHighlightsQuery
}): Promise<{pagination: SummaryHighlightsPagination, highlights: Highlight[]}> => {
  const state = args.getState();
  const book = bookSelector(state);

  const {page, sourceIds, perPage} = previousPagination
    ? incrementPage(previousPagination)
    : {
      page: 1,
      perPage: args.pageSize || maxHighlightsApiPageSize,
      sourceIds: getNewSources(state, args.sourcesFetched, args.pageSize),
    };

  if (!book || sourceIds.length === 0) {
    return {pagination: null, highlights: args.highlights || []};
  }

  const {highlights, pagination} = await fetchHighlightsForSource({
    book,
    highlightClient: args.highlightClient,
    pagination: {page, sourceIds, perPage},
    prevHighlights: args.highlights,
    query: args.query,
  });

  if (highlights.length < perPage || !args.pageSize) {
    return loadUntilPageSize({
      ...args,
      highlights,
      previousPagination: pagination,
      sourcesFetched: [...args.sourcesFetched, ...sourceIds],
    });
  }
  return {pagination, highlights};
};

export const createSummaryHighlightsLoader = ({
  locationFilters,
  previousPagination,
  sourcesFetched,
  query,
}: {
  locationFilters: HighlightLocationFilters,
  previousPagination: SummaryHighlightsPagination,
  sourcesFetched: string[],
  query: SummaryHighlightsQuery,
}) => async({getState, highlightClient}: MiddlewareAPI & AppServices, pageSize?: number) => {
  const {pagination, highlights} = await loadUntilPageSize({
    getState,
    highlightClient,
    pageSize,
    previousPagination,
    query,
    sourcesFetched,
  });

  const formattedHighlights = formatReceivedHighlights(highlights, locationFilters);

  return {formattedHighlights, pagination};
};
