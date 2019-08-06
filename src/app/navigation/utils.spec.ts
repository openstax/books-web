import { Location } from 'history';
import { AppServices, AppState, MiddlewareAPI } from '../types';
import { locationChange } from './actions';
import { AnyMatch } from './types';
import { findRouteMatch, matchUrl, routeHook } from './utils';

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
