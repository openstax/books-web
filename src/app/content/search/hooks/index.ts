import isEqual from 'lodash/fp/isEqual';
import { recordError } from '../../../errors/actions';
import { searchReducer } from '../../../errors/types';
import { push, replace } from '../../../navigation/actions';
import { RouteHookBody } from '../../../navigation/types';
import { ActionHookBody } from '../../../types';
import { actionHook, assertDefined } from '../../../utils';
import { openToc } from '../../actions';
import { content } from '../../routes';
import * as selectContent from '../../selectors';
import { findArchiveTreeNode } from '../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../utils/idUtils';
import { getBookPageUrlAndParams } from '../../utils/urlUtils';
import { clearSearch, receiveSearchResults, requestSearch, selectSearchResult } from '../actions';
import * as select from '../selectors';
import { getFirstResult, getIndexData, getSearchFromLocation } from '../utils';
import trackSearch from './trackSearch';

export const requestSearchHook: ActionHookBody<typeof requestSearch> = (services) => async({payload, meta}) => {
  const state = services.getState();
  const book = selectContent.book(state);

  if (!book || !payload) {
    return;
  }

  try {
    const results = await services.searchClient.search({
      books: [`${book.id}@${book.version}`],
      indexStrategy: 'i1',
      q: payload,
      searchStrategy: 's1',
    });
    services.dispatch(receiveSearchResults(results, meta));
  } catch (error) {
    services.dispatch(recordError({targetReducer: searchReducer, error}));
  }
};

export const receiveSearchHook: ActionHookBody<typeof receiveSearchResults> = (services) => ({payload, meta}) => {
  const state = services.getState();
  const {page, book} = selectContent.bookAndPage(state);
  const query = select.query(state);
  const savedSearch = getSearchFromLocation(services.history.location);

  if (!page || !book) {
    return; // book changed while query was in the air
  }

  const selectedResult = meta && meta.selectedResult ? meta.selectedResult : getFirstResult(book, payload);

  if (!selectedResult) {
    return;
  }

  const targetPageId = selectedResult.result.source.pageId;
  const targetPage = assertDefined(
    findArchiveTreeNode(book.tree, targetPageId),
    'search result pointed to page that wasn\'t in book'
  );

  const savedQuery = savedSearch ? savedSearch.query : null;
  if (
    savedQuery === query &&
    page.id === stripIdVersion(targetPage.id) &&
    isEqual(select.selectedResult(state), selectedResult)
  ) {
    return; // if search and page match current history record, noop
  }

  if (book.id !== getIndexData(selectedResult.result.index).bookId) {
    return;
  }

  services.dispatch(selectSearchResult(selectedResult));

  const navigation = {
    params: getBookPageUrlAndParams(book, targetPage).params,
    route: content,
    state : {
      bookUid: book.id,
      bookVersion: book.version,
      pageUid: stripIdVersion(targetPage.id),
      search: {query, selectedResult},
    },
  };

  const action = stripIdVersion(page.id) === stripIdVersion(targetPage.id) ? replace : push;

  services.dispatch(action(navigation));
};

export const clearSearchHook: ActionHookBody<typeof clearSearch | typeof openToc> = (services) => () => {
  if (services.history.location.state && services.history.location.state.search) {
    services.history.replace({
      state: {
        ...services.history.location.state,
        search: null,
      },
    });
  }
};

// composed in /content/locationChange hook because it needs to happen after book load
export const syncSearch: RouteHookBody<typeof content> = (services) => async(locationChange) => {
  const query = select.query(services.getState());
  const selectedResult = select.selectedResult(services.getState());
  const savedSearch = getSearchFromLocation(locationChange.location);

  if (savedSearch && savedSearch.query && savedSearch.query !== query) {
    services.dispatch(
      requestSearch(
        savedSearch.query,
        savedSearch.selectedResult ? {
          isResultReload: true,
          selectedResult: savedSearch.selectedResult,
        } : undefined
      )
    );
  } else if (savedSearch && savedSearch.selectedResult && !isEqual(savedSearch.selectedResult, selectedResult)) {
    services.dispatch(selectSearchResult(savedSearch.selectedResult));
  } else if ((!savedSearch || !savedSearch.query) && query) {
    services.dispatch(clearSearch());
  }
};

export default [
  trackSearch,
  actionHook(clearSearch, clearSearchHook),
  actionHook(openToc, clearSearchHook),
  actionHook(requestSearch, requestSearchHook),
  actionHook(receiveSearchResults, receiveSearchHook),
];
