import { Location } from 'history';
import queryString from 'querystring';
import { Params } from '../content/types';
import { AppServices, AppState, MiddlewareAPI } from '../types';
import { locationChange } from './actions';
import { AnyMatch, AnyRoute } from './types';
import {
  findPathForParams,
  findRouteMatch,
  getScrollTargetFromQuery,
  getUrlRegexParams,
  injectParamsToBaseUrl,
  isScrollTarget,
  matchPathname,
  matchSearch,
  matchUrl,
  routeHook,
  updateQuery,
} from './utils';

const routes = [
  {
    component: () => null,
    getUrl: () => 'url1',
    name: 'basic test',
    paths: ['/basic'],
  },
  {
    component: () => null,
    getUrl: () => 'url2',
    name: 'with params',
    paths: ['/with/:param?'],
  },
  {
    component: () => null,
    getSearch: () => 'archive=https://archive-content03.cnx.org',
    getUrl: () => 'url3',
    name: 'with search',
    paths: ['/with/:search?'],
  },
  {
    component: () => null,
    name: 'with no search',
    paths: ['/with/:nosearch?'],
  },
] as AnyRoute[];

describe('findRouteMatch', () => {
  it('returns undefined for no matching route', () => {
    const location = {pathname: '/wakawakawaka'} as Location;
    const result = findRouteMatch(routes, location);
    expect(result).toEqual(undefined);
  });

  it('returns match for route without params', () => {
    const location = {pathname: '/basic'} as Location;
    const result = findRouteMatch(routes, location);
    expect(result).toEqual({route: routes[0], params: {}, state: {}});
  });

  it('returns match for route with params', () => {
    const location = {pathname: '/with/thing'} as Location;
    const result = findRouteMatch(routes, location);
    expect(result).toEqual({route: routes[1], params: {param: 'thing'}, state: {}});
  });

  it('returns undefined for missing param values', () => {
    const location = {pathname: '/with'} as Location;
    const result = findRouteMatch(routes, location);
    expect(result).toEqual({route: routes[1], params: {param: undefined}, state: {}});
  });
});

describe('routeHook', () => {
  it('binds state helpers', () => {
    const helperSpy = jest.fn();
    const helpers = {
      dispatch: () => undefined,
      getState: () => ({} as AppState),
    } as any as MiddlewareAPI & AppServices;

    const middleware = routeHook(routes[0], helperSpy);

    middleware(helpers)(helpers);

    expect(helperSpy).toHaveBeenCalledWith(helpers);
  });

  it('hooks into requested route', () => {
    const hookSpy = jest.fn();
    const helpers = {dispatch: () => undefined, getState: () => ({} as AppState)} as any as MiddlewareAPI & AppServices;
    const middleware = routeHook(routes[0], () => hookSpy);
    const payload = {
      action: 'POP' as 'POP',
      location: {} as Location,
      match: {
        route: routes[0],
      },
    };

    middleware(helpers)(helpers)((action) => action)(locationChange(payload as any));

    expect(hookSpy).toHaveBeenCalledWith({...payload, query: {}});
  });

  it('doens\'t hook into other routes', () => {
    const hookSpy = jest.fn();
    const helpers = {dispatch: () => undefined, getState: () => ({} as AppState)} as any as MiddlewareAPI & AppServices;
    const middleware = routeHook(routes[0], () => hookSpy);
    const payload = {
      action: 'POP' as 'POP',
      location: {} as Location,
      match: {
        route: routes[1],
      },
    };

    middleware(helpers)(helpers)((action) => action)(locationChange(payload as any));

    expect(hookSpy).not.toHaveBeenCalled();
  });
});

describe('matchPathname', () => {
  it('renders a path with no params', () => {
    expect(matchPathname({route: routes[0]} as unknown as AnyMatch)).toEqual('url1');
  });

  it('renders a path with params', () => {
    const spy = jest.spyOn(routes[1], 'getUrl');
    const params = {foo: 'bar'};

    expect(matchPathname({route: routes[1], params} as unknown as AnyMatch)).toEqual('url2');
    expect(spy).toHaveBeenCalledWith(params);
  });
});

describe('matchUrl', () => {
  it('renders a url with just a path', () => {
    expect(matchUrl({route: routes[0], params: {}, state: {}})).toEqual('url1');
  });

  it('renders url with path and query', () => {
    expect(matchUrl({route: routes[2], params: {}, state: {}}))
      .toEqual('url3?archive=https%3A%2F%2Farchive-content03.cnx.org');
  });
});

describe('findPathForParams', () => {
  const exampleRoutes = [
    '/b/:book_slug/p/:page_slug',
    '/b/:book_slug@:book_version/p/:page_slug',
  ];

  const params: Params = {
    book: {
      slug: 'randomBookSlug',
      version: '11.1',
    },
    page: {
      slug: 'randomPageSlug',
    },
  };

  it('finds path', () => {
    expect(findPathForParams(getUrlRegexParams(params), exampleRoutes)).toBe(exampleRoutes[1]);
  });

  it('doesn\'t match if path is missing params', () => {
    expect(findPathForParams(getUrlRegexParams({...params, unknownParam: '1'}), exampleRoutes)).toBe(undefined);
  });

  it('matches new params', () => {
    const pathForNewParam = '/b/:book_slug@:book_version/p/:page_slug/:book_unknownParam';

    expect(findPathForParams(getUrlRegexParams({...params, book: {...params.book, unknownParam: '1'}}), [
      ...exampleRoutes,
      pathForNewParam,
    ])).toBe(pathForNewParam);
  });

  it('works for paths with regexp', () => {
    const pathWithRegexp = `/b/:book_uuid([\da-z]{8}-[\da-z]{4}-[\da-z]{4}-[\da-z]{4}-[\da-z]{12})/p/:page_slug`;

    expect(findPathForParams(getUrlRegexParams({...params, book: {uuid: '1'}}), [
      ...exampleRoutes,
      pathWithRegexp,
    ])).toBe(pathWithRegexp);
  });
});

describe('injectParamsToBaseUrl', () => {
  it('injects params to base url', () => {
    const injected = injectParamsToBaseUrl('/:book', {book: ['book_asdf@:book_other']});
    expect(injected.length).toBe(1);
    expect(injected[0]).toBe('/:book_asdf@:book_other');
  });

  it('only injects if param is preceeded by ":"', () => {
    const injected = injectParamsToBaseUrl('/:book/doesntmatter/book_other', {book: ['book_asdf@book_other']});
    expect(injected.length).toBe(1);
    expect(injected[0]).toBe('/:book_asdf@book_other/doesntmatter/book_other');
  });

  it('makes all possible combinations of params', () => {
    const injected = injectParamsToBaseUrl('/:book/:page/:version', {
      book: ['b1', 'b2'],
      page: ['p1', 'p2'],
      version: ['v1', 'v2'],
    });

    expect(injected.length).toBe(8);
    expect(injected[0]).toBe('/:b1/:p1/:v1');
    expect(injected[1]).toBe('/:b1/:p1/:v2');
    expect(injected[7]).toBe('/:b2/:p2/:v2');
  });

  it('ignores missing params', () => {
    const injected = injectParamsToBaseUrl('/:book/:page', {book: ['book_asf']});
    expect(injected.length).toBe(1);
    expect(injected[0]).toBe('/:book_asf/:page');
  });
});

describe('matchSearch', () => {

  it('renders no url with no params or search', () => {
    expect(matchSearch( {route: routes[0]} as AnyMatch, undefined)).toEqual('');
  });

  it('renders a url with search', () => {
    const spy = jest.spyOn(routes[2], 'getSearch');
    const params = { foo: 'bar' } as unknown as Params;

    expect(
      matchSearch(
        {route: routes[2], params} as AnyMatch,
        {}
      )
    ).toEqual('archive=https%3A%2F%2Farchive-content03.cnx.org');
    expect(spy).toHaveBeenCalledWith(params);
  });

  it('renders no match with params and no search', () => {
    const params = {foo: 'bar'} as unknown as Params;

    expect(matchSearch({route: routes[3], params} as AnyMatch, undefined))
    .toEqual('');
  });

  it('renders match with no params and search', () => {
    expect(
      matchSearch(
        {route: routes[2]} as AnyMatch,
        {}
      )
    ).toEqual('archive=https%3A%2F%2Farchive-content03.cnx.org');
  });
});

describe('isScrollTarget', () => {
  it('return true if passed object is vali scroll target', () => {
    expect(isScrollTarget({ type: 'some-type', elementId: 'elem' })).toEqual(true);
  });

  it('return false if passed object does not have elementId or type', () => {
    expect(isScrollTarget({ elementId: '' })).toEqual(false);
    expect(isScrollTarget({ notType: 'some-type', elementId: 'elem' })).toEqual(false);
  });

  it('return false if elementId or type has wrong type', () => {
    expect(isScrollTarget({ type: 1, elementId: 'elem' })).toEqual(false);
    expect(isScrollTarget({ type: 'type', elementId: 1 })).toEqual(false);
  });
});

describe('getScrollTargetFromQuery', () => {
  it('return valid scroll target from query', () => {
    const scrollTarget = { type: 'search', index: 0, elementId: 'elId' };
    expect(getScrollTargetFromQuery(
      queryString.parse('target={"type": "search", "index": 0}'),
      'elId'
    )).toEqual(scrollTarget);
  });

  it('returns null if could not parse target as JSON', () => {
    expect(getScrollTargetFromQuery(
      queryString.parse('target={//}'),
      'elId'
    )).toEqual(null);
  });

  it('returns null if parsed target is not an object', () => {
    expect(getScrollTargetFromQuery(
      queryString.parse('target=[1,2]'),
      'elId'
    )).toEqual(null);
  });

  it('returns null if parsed target is not valid scroll target', () => {
    expect(getScrollTargetFromQuery(
      queryString.parse('target={"prop": "not-scroll-target"}'),
      'elId'
    )).toEqual(null);
  });
});

describe('updateQuery', () => {
  it('returns a query string for a parameter', () => {
    expect(updateQuery({myParameter: 'whatever'}))
      .toBe('myParameter=whatever');
  });
  it('adds parameters to an existing query', () => {
    expect(updateQuery({myParameter: 'whatever'}, 'a=1&b=3'))
      .toBe('a=1&b=3&myParameter=whatever');
  });
});
