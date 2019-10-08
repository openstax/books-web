import createTestStore from '../../../test/createTestStore';
import { book, page, shortPage } from '../../../test/mocks/archiveLoader';
import { makeSearchResultHit, makeSearchResults } from '../../../test/searchResults';
import { Store } from '../../types';
import { receivePage } from '../actions';
import { receiveSearchResults } from './actions';
import * as select from './selectors';

let store: Store;

beforeEach(() => {
  store = createTestStore();
});

describe('currentPageResults', () => {

  it('returns false with no results or page', () => {
    expect(select.currentPageResults(store.getState())).toEqual([]);
  });

  it('returns results for current page', () => {
    const hit = makeSearchResultHit({page, book});
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveSearchResults(makeSearchResults([
      hit,
    ])));

    expect(select.currentPageResults(store.getState())).toEqual([hit]);
  });

  it('doesn\'t reutrn results for other page', () => {
    const hit = makeSearchResultHit({page, book});
    store.dispatch(receivePage({...shortPage, references: []}));
    store.dispatch(receiveSearchResults(makeSearchResults([
      hit,
    ])));

    expect(select.currentPageResults(store.getState())).toEqual([]);
  });
});
