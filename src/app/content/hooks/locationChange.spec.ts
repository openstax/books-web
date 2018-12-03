import { Location } from 'history';
import cloneDeep from 'lodash/fp/cloneDeep';
import FontCollector from '../../../helpers/FontCollector';
import PromiseCollector from '../../../helpers/PromiseCollector';
import { locationChange } from '../../navigation/actions';
import { Match } from '../../navigation/types';
import { AppServices, AppState, Dispatch, MiddlewareAPI } from '../../types';
import * as actions from '../actions';
import { initialState } from '../reducer';
import * as routes from '../routes';
import { ArchiveBook, ArchivePage, Book, Page, Params, State } from '../types';

describe('locationChange', () => {
  let localState: State;
  let appState: AppState;
  let archiveLoader: {[k in  keyof AppServices['archiveLoader']]: jest.SpyInstance};
  let dispatch: jest.SpyInstance;
  let helpers: MiddlewareAPI & AppServices;
  let payload: {location: Location, match: Match<typeof routes.content>};
  let action: ReturnType<typeof locationChange>;
  let hook = require('./locationChange').default;
  const next: Dispatch = (a) => a;

  beforeEach(() => {
    localState = cloneDeep(initialState);
    appState = {content: localState} as AppState;

    archiveLoader = {
      book: jest.fn(() => Promise.resolve({} as ArchiveBook)),
      cachedBook: jest.fn(() => ({} as ArchiveBook)),
      cachedPage: jest.fn(() => ({} as ArchivePage)),
      page: jest.fn(() => Promise.resolve({} as ArchivePage)),
    };

    dispatch = jest.fn((a) => a);
    helpers = {
      archiveLoader,
      dispatch,
      fontCollector: new FontCollector(),
      getState: () => appState,
      promiseCollector: new PromiseCollector(),
    } as any as MiddlewareAPI & AppServices;

    payload = {location: {} as Location, match: {route: routes.content, params: {} as Params}};
    action = locationChange(payload);

    hook = (require('./locationChange').default)(helpers);
  });

  afterEach(() => {
    jest.resetModules();
  });

  it('loads book', () => {
    localState.params = payload.match.params = {
      bookId: 'bookId',
      pageId: 'pageId',
    };

    hook(helpers)(next)(action);
    expect(dispatch).toHaveBeenCalledWith(actions.requestBook('bookId'));
    expect(archiveLoader.book).toHaveBeenCalledWith('bookId');
  });

  it('doesn\'t load book if its already loaded', () => {
    localState.book = {
      id: 'bookId',
    } as Book;
    localState.params = payload.match.params = {
      bookId: 'bookId',
      pageId: 'pageId',
    };

    hook(helpers)(next)(action);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestBook('bookId'));
    expect(archiveLoader.book).not.toHaveBeenCalled();
  });

  it('doesn\'t load book if its already loading', () => {
    localState.loading.book = 'bookId';
    localState.params = payload.match.params = {
      bookId: 'bookId',
      pageId: 'pageId',
    };

    hook(helpers)(next)(action);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestBook('bookId'));
    expect(archiveLoader.book).not.toHaveBeenCalled();
  });

  it('loads page', () => {
    localState.params = payload.match.params = {
      bookId: 'bookId',
      pageId: 'pageId',
    };

    hook(helpers)(next)(action);
    expect(dispatch).toHaveBeenCalledWith(actions.requestPage('pageId'));
    expect(archiveLoader.page).toHaveBeenCalledWith('bookId', 'pageId');
    expect(archiveLoader.book).not.toHaveBeenCalledWith('pageId');
  });

  it('doesn\'t load page if its already loaded', () => {
    localState.page = {
      id: 'pageId',
    } as Page;
    localState.params = payload.match.params = {
      bookId: 'bookId',
      pageId: 'pageId',
    };

    hook(helpers)(next)(action);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestPage('pageId'));
    expect(archiveLoader.page).not.toHaveBeenCalled();
    expect(archiveLoader.book).not.toHaveBeenCalledWith('pageId');
  });

  it('doesn\'t load page if its already loading', () => {
    localState.loading.page = 'pageId';
    localState.params = payload.match.params = {
      bookId: 'bookId',
      pageId: 'pageId',
    };

    hook(helpers)(next)(action);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestPage('pageId'));
    expect(archiveLoader.page).not.toHaveBeenCalled();
    expect(archiveLoader.book).not.toHaveBeenCalledWith('pageId');
  });

  it('adds font to fontcollector', () => {
    const mockFont = 'https://fonts.googleapis.com/css?family=Noto+Sans:400,400i,700,700i';
    jest.mock('cnx-recipes/styles/output/intro-business.json', () => `"${mockFont}"`);
    const spy = jest.spyOn(helpers.fontCollector, 'add');
    jest.resetModules();
    hook = (require('./locationChange').default)(helpers);

    hook(helpers)(next)(action);
    expect(spy).toHaveBeenCalledWith(mockFont);
  });

  it('doesn\'t break if there are no fonts in the css', () => {
    jest.mock('cnx-recipes/styles/output/intro-business.json', () => `""`);
    const spy = jest.spyOn(helpers.fontCollector, 'add');
    jest.resetModules();
    hook = (require('./locationChange').default)(helpers);

    hook(helpers)(next)(action);
    expect(spy).not.toHaveBeenCalled();
  });

  it('loads more specific data when available', () => {
    localState.params = payload.match.params = {
      bookId: 'bookId',
      pageId: 'pageId',
    };

    payload.match.state = {
      bookUid: 'longbookid',
      bookVersion: 'bookversion',
      pageUid: 'longpageid',
    };

    hook(helpers)(next)(action);
    expect(archiveLoader.book).not.toHaveBeenCalledWith('bookId');
    expect(archiveLoader.page).not.toHaveBeenCalledWith('bookId', 'pageId');
    expect(archiveLoader.book).toHaveBeenCalledWith('longbookid@bookversion');
    expect(archiveLoader.page).toHaveBeenCalledWith('longbookid@bookversion', 'longpageid');
  });
});
