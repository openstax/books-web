import { Location } from 'history';
import { Params } from '../content/types';
import { AppServices, AppState, MiddlewareAPI } from '../types';
import { locationChange } from './actions';
import { AnyMatch } from './types';
import {
  findPathForParams,
  findRouteMatch,
  getUrlRegexParams,
  injectParamsToBaseUrl,
  matchUrl,
  routeHook
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
];

describe('findRouteMatch', () => {
  it('returns undefined for no matching route', () => {
    const location = {pathname: '/wakawakawaka'} as Location;
    const result = findRouteMatch(routes, location);
    expect(result).toEqual(undefined);
  });

  it('returns match for route without params', () => {
    const location = {pathname: '/basic'} as Location;
    const result = findRouteMatch(routes, location);
    expect(result).toEqual({route: routes[0]});
  });

  it('returns match for route with params', () => {
    const location = {pathname: '/with/thing'} as Location;
    const result = findRouteMatch(routes, location);
    expect(result).toEqual({route: routes[1], params: {param: 'thing'}});
  });

  it('returns undefined for missing param values', () => {
    const location = {pathname: '/with'} as Location;
    const result = findRouteMatch(routes, location);
    expect(result).toEqual({route: routes[1], params: {param: undefined}});
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

    middleware(helpers)(helpers)((action) => action)(locationChange(payload));

    expect(hookSpy).toHaveBeenCalledWith(payload);
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

    middleware(helpers)(helpers)((action) => action)(locationChange(payload));

    expect(hookSpy).not.toHaveBeenCalled();
  });
});

describe('matchUrl', () => {

  it('renders a url with no params', () => {
    expect(matchUrl({route: routes[0]} as unknown as AnyMatch)).toEqual('url1');
  });

  it('renders a url with params', () => {
    const spy = jest.spyOn(routes[1], 'getUrl');
    const params = {foo: 'bar'};

    expect(matchUrl({route: routes[1], params} as unknown as AnyMatch)).toEqual('url2');
    expect(spy).toHaveBeenCalledWith(params);
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
