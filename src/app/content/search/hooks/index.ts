import isEqual from 'lodash/fp/isEqual';
import queryString from 'query-string';
import { push, replace } from '../../../navigation/actions';
import * as selectNavigation from '../../../navigation/selectors';
import { RouteHookBody } from '../../../navigation/types';
import { ActionHookBody } from '../../../types';
import { actionHook, assertDefined } from '../../../utils';
import { openToc } from '../../actions';
import { content } from '../../routes';
import * as selectContent from '../../selectors';
import { findArchiveTreeNodeById } from '../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../utils/idUtils';
import { getBookPageUrlAndParams } from '../../utils/urlUtils';
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

  if (pageIsLoading || !book) {
    return; // book changed while query was in the air
  }

  const searchResultHit = meta && meta.searchScrollTarget && findSearchResultHit(results, meta.searchScrollTarget);
  const selectedResult = searchResultHit && meta.searchScrollTarget
    ? {result: searchResultHit, highlight: meta.searchScrollTarget.index}
    : getFirstResult(book, payload);

  if (
    // selectedResult may equal to null if api did not return any results
    !selectedResult
    // We are clearing selected result when requesting a new search so in the theory this should never happen
    || isEqual(select.selectedResult(state), selectedResult)
    // selectedResult bookId data is different than current book id
    || book.id !== getIndexData(selectedResult.result.index).bookId
  ) {
    return;
  }

  services.dispatch(selectSearchResult(selectedResult));

  const targetPageId = selectedResult.result.source.pageId;
  const targetPage = assertDefined(
    findArchiveTreeNodeById(book.tree, targetPageId),
    'search result pointed to page that wasn\'t in book'
  );

  // currentPage may by undefined when user started a search from the 404 page
  const page = currentPage || targetPage;

  const navigation = {
    params: getBookPageUrlAndParams(book, targetPage).params,
    route: content,
    state : {
      bookUid: book.id,
      bookVersion: book.version,
      pageUid: stripIdVersion(targetPage.id),
    },
  };

  const action = stripIdVersion(page.id) === stripIdVersion(targetPage.id) ? replace : push;
  const search = queryString.stringify({
    query,
    target: JSON.stringify({ type: 'search', index: selectedResult.highlight }),
  });
  const hash = selectedResult.result.source.elementId;

  services.dispatch(action(navigation, { hash, search }));
};

export const clearSearchHook: ActionHookBody<typeof clearSearch | typeof openToc> = (services) => () => {
  const scrollTarget = selectNavigation.scrollTarget(services.getState());
  if (scrollTarget && isSearchScrollTarget(scrollTarget)) {
    services.history.replace({
      hash: '',
      search: '',
    });
  }
};

// composed in /content/locationChange hook because it needs to happen after book load
export const syncSearch: RouteHookBody<typeof content> = (services) => async() => {
  const state = services.getState();
  const navigationQuery = selectNavigation.query(state).query;
  const searchQuery = select.query(state);
  const scrollTarget = selectNavigation.scrollTarget(state);
  const searchScrollTarget = scrollTarget && isSearchScrollTarget(scrollTarget) ? scrollTarget : null;
  const searchHits = select.hits(state) || [];
  const keyTermHits = select.keyTermHits(state) || [];
  const targettedHit = searchScrollTarget && findSearchResultHit([...searchHits, ...keyTermHits], searchScrollTarget);
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
