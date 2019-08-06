import { push, replace } from '../../navigation/actions';
import { RouteHookBody } from '../../navigation/types';
import { ActionHookBody, AppServices, MiddlewareAPI } from '../../types';
import { actionHook } from '../../utils';
import { content } from '../routes';
import * as selectContent from '../selectors';
import { stripIdVersion } from '../utils/idUtils';
import { getBookPageUrlAndParams } from '../utils/urlUtils';
import { clearSearch, receiveSearchResults, requestSearch } from './actions';
import * as select from './selectors';
import { getFirstResultPage, getIndexData, getSearchFromLocation } from './utils';

export const requestSearchHook: ActionHookBody<typeof requestSearch> = (services) => async({payload}) => {
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

  services.dispatch(receiveSearchResults(results));
};

export const receiveSearchHook: ActionHookBody<typeof receiveSearchResults> = (services) => ({payload}) => {
  const state = services.getState();
  const search = select.query(state);
  const {page, book} = selectContent.bookAndPage(state);

  if (!page || !book) {
    return; // book changed while query was in the air
  }

  const firstResultPage = getFirstResultPage(book, payload);
  const firstResult = firstResultPage && firstResultPage.results[0];

  if (!firstResult || !firstResultPage) {
    return; // no results
  }

  if (book.id !== getIndexData(firstResult.index).bookId) {
    return; // book changed while query was in the air
  }

  const savedQuery = getSearchFromLocation(services.history.location);
  if (savedQuery === search && page.id === stripIdVersion(firstResultPage.id)) {
    return; // if search and page match current history record, noop
  }

  const navigation = {
    params: getBookPageUrlAndParams(book, firstResultPage).params,
    route: content,
    state : {
      bookUid: book.id,
      bookVersion: book.version,
      pageUid: stripIdVersion(firstResultPage.id),
      search,
    },
  };

  const action = stripIdVersion(page.id) === stripIdVersion(firstResultPage.id) ? replace : push;

  services.dispatch(action(navigation));
};

// composed in /content/locationChange hook because it needs to happen after book load
export const syncSearch: RouteHookBody<typeof content> = (services) => async(locationChange) => {
  const query = select.query(services.getState());
  const savedQuery = getSearchFromLocation(locationChange.location);

  if (locationChange.action === 'POP') { // on initial load or back/forward button, load state
    loadSearch(services, query, savedQuery);
  }
};

export default [
  actionHook(requestSearch, requestSearchHook),
  actionHook(receiveSearchResults, receiveSearchHook),
];

function loadSearch(
  services: AppServices & MiddlewareAPI,
  query: string | null,
  savedQuery: string | null
) {
  if (savedQuery && savedQuery !== query) {
    services.dispatch(requestSearch(savedQuery));
  } else if (!savedQuery && query) {
    services.dispatch(clearSearch());
  }
}
