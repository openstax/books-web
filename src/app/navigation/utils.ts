import { flatten, unflatten } from 'flat';
import { Action, Location } from 'history';
import curry from 'lodash/fp/curry';
import pathToRegexp, { Key } from 'path-to-regexp';
import querystring from 'querystring';
import { Dispatch } from 'redux';
import { actionHook } from '../utils';
import * as actions from './actions';
import { hasParams } from './guards';
import { AnyMatch, AnyRoute, GenericMatch,
  LocationChange, Match, RouteHookBody, RouteState } from './types';

const delimiter = '_';

export const matchForRoute = <R extends AnyRoute>(route: R, match: GenericMatch | undefined): match is Match<R> =>
  !!match && match.route.name === route.name;

export const locationChangeForRoute = <R extends AnyRoute>(
  route: R,
  locationChange: LocationChange
): locationChange is Required<LocationChange<Match<R>>> =>
  !!locationChange.match && locationChange.match.route.name === route.name;

export const getUrlRegexParams = <T extends {}>(obj: T): T => flatten(obj, {delimiter});

const getMatchParams = (keys: Key[], match: RegExpExecArray) => {
  const [, ...values] = match;
  return unflatten(keys.reduce((result, key, index) => {
    const value = values[index] ? decodeURIComponent(values[index]) : values[index];
    return {...result, [key.name] : value};
  }, {}), {delimiter});
};

const formatRouteMatch = <R extends AnyRoute>(route: R, state: RouteState<R>, keys: Key[], match: RegExpExecArray) => ({
  route,
  state,
  ...(keys.length > 0 ? {params: getMatchParams(keys, match)} : {}),
} as AnyMatch);

export const findRouteMatch = (routes: AnyRoute[], location: Location): AnyMatch | undefined => {
  for (const route of routes) {
    for (const path of route.paths) {
      const keys: Key[] = [];
      const re = pathToRegexp(path, keys, {end: true});
      const match = re.exec(location.pathname);
      if (match) {
        return formatRouteMatch(route, location.state, keys, match);
      }
    }
  }
};

export const matchSearch = (action: AnyMatch, search: string | undefined) => {
  const previous = querystring.parse(search || '');

  const route = querystring.parse(hasParams(action)
    ? action.route.getSearch ? action.route.getSearch(action.params) : ''
    : action.route.getSearch ? action.route.getSearch() : ''
  );

  return querystring.stringify({
    ...previous,
    ...route,
  });
};

export const matchUrl = (action: AnyMatch) => hasParams(action)
  ? action.route.getUrl(action.params)
  : (action.route.getUrl)();

export const changeToLocation = curry((routes: AnyRoute[], dispatch: Dispatch, location: Location, action: Action) => {
  const match = findRouteMatch(routes, location);
  dispatch(actions.locationChange({location, match, action}));
});

export const routeHook = <R extends AnyRoute>(route: R, body: RouteHookBody<R>) =>
  actionHook(actions.locationChange, (stateHelpers) => {
    const boundHook = body(stateHelpers);

    return (action) => {
      if (locationChangeForRoute(route, action.payload)) {
        return boundHook(action.payload);
      }
    };
  });
