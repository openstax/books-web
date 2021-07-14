import isEqual from 'lodash/fp/isEqual';
import queryString from 'query-string';
import { push, replace } from '../../../navigation/actions';
import * as selectNavigation from '../../../navigation/selectors';
import { RouteHookBody } from '../../../navigation/types';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { assertDefined } from '../../../utils/assertions';
import { openToc } from '../../actions';
import { content } from '../../routes';
import * as selectContent from '../../selectors';
import { findArchiveTreeNodeById } from '../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../utils/idUtils';
import { createNavigationMatch } from '../../utils/navigationUtils';
import { clearSearch, receiveSearchResults, requestSearch, selectSearchResult } from '../actions';
import { isSearchScrollTarget } from '../guards';
import * as select from '../selectors';
import { findSearchResultHit, getFirstResult, getIndexData } from '../utils';
import trackSearch from './trackSearch';

export const requestSearchHook: ActionHookBody<typeof requestSearch> = (services) => async({payload, meta}) => {
  const state = services.getState();
  const book = selectContent.book(state);

  if (!book || !payload) {
    return;
  }

  const results = await services.searchClient.search({
    books: [`${book.id}@${book.version}`],
    indexStrategy: 'i1',
    q: payload,
    searchStrategy: 's1',
  });

  services.dispatch(receiveSearchResults(results, meta));
};

export const receiveSearchHook: ActionHookBody<typeof receiveSearchResults> = (services) => ({payload, meta}) => {
  const state = services.getState();
  const {page: currentPage, book} = selectContent.bookAndPage(state);
  const pageIsLoading = selectContent.loadingPage(state);
  const query = select.query(state);
  const results = select.hits(state) || [];
  const systemQueryParams = selectNavigation.systemQueryParameters(state);

  if (pageIsLoading || !book) {
    return; // book changed while query was in the air
  }

  const searchResultHit = meta && meta.searchScrollTarget && findSearchResultHit(results, meta.searchScrollTarget);
  const selectedResult = searchResultHit && meta.searchScrollTarget
    ? {result: searchResultHit, highlight: meta.searchScrollTarget.index}
    : getFirstResult(book, payload);

  if (
    selectedResult
    // We are clearing selected result when requesting a new search so in the theory this should never happen
    && (isEqual(select.selectedResult(state), selectedResult)
      // selectedResult bookId data is different than current book id
      || book.id !== getIndexData(selectedResult.result.index).bookId)
  ) {
    return;
  }

  if (selectedResult) {
    services.dispatch(selectSearchResult(selectedResult));
  }

  const targetPageId = selectedResult?.result.source.pageId || currentPage?.id;

  const action = (targetPageId && stripIdVersion(targetPageId)) === (currentPage && stripIdVersion(currentPage.id))
    ? replace : push;

  const options = selectedResult
    ? {
      hash: selectedResult.result.source.elementId,
      search: queryString.stringify({
        query,
        target: JSON.stringify({ type: 'search', index: selectedResult.highlight }),
        ...systemQueryParams,
      }),
    }
    : { search: queryString.stringify({ query }) };

  const navigationMatch = targetPageId
    ? createNavigationMatch(
      assertDefined(
        findArchiveTreeNodeById(book.tree, targetPageId),
        'search result pointed to page that wasn\'t in book'
      ), book)
    : selectNavigation.match(state);

  if (navigationMatch) {
    services.dispatch(action(navigationMatch, options));
  }
};

export const clearSearchHook: ActionHookBody<typeof clearSearch | typeof openToc> = (services) => () => {
  const systemQueryParams = selectNavigation.systemQueryParameters(services.getState());

  services.history.replace({
    hash: '',
    search: queryString.stringify(systemQueryParams),
  });
};

// composed in /content/locationChange hook because it needs to happen after book load
export const syncSearch: RouteHookBody<typeof content> = (services) => async() => {
  const state = services.getState();
  const navigationQuery = selectNavigation.query(state).query;
  const searchQuery = select.query(state);
  const scrollTarget = selectNavigation.scrollTarget(state);
  const searchScrollTarget = scrollTarget && isSearchScrollTarget(scrollTarget) ? scrollTarget : null;
  const searchHits = select.hits(state) || [];
  const targettedHit = searchScrollTarget && findSearchResultHit(searchHits, searchScrollTarget);
  const navigationSelectedResult = targettedHit && searchScrollTarget
    ? { result: targettedHit, highlight: searchScrollTarget.index }
    : null;
  const currentSelectedResult = select.selectedResult(state);

  if (typeof navigationQuery === 'string' && navigationQuery !== searchQuery) {
    services.dispatch(requestSearch(
      navigationQuery,
      searchScrollTarget ? { isResultReload: true, searchScrollTarget } : undefined
    ));
  } else if (
    navigationSelectedResult
    && (!currentSelectedResult || !isEqual(navigationSelectedResult, currentSelectedResult))
  ) {
    services.dispatch(selectSearchResult(navigationSelectedResult));
  }
};

export default [
  trackSearch,
  actionHook(clearSearch, clearSearchHook),
  actionHook(openToc, clearSearchHook),
  actionHook(requestSearch, requestSearchHook),
  actionHook(receiveSearchResults, receiveSearchHook),
];
