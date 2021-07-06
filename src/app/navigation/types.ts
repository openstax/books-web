import { Action, Location } from 'history';
import { OutputParams } from 'query-string';
import { ComponentType } from 'react';
import { routes } from '../';
import { AnyAction, AppServices, MiddlewareAPI } from '../types';

export type State = Location & {
  match?: AnyMatch;
  query: OutputParams;
};

export type RouteParams<R> = R extends Route<infer P> ? P : never;
export type RouteState<R> = R extends Route<any, infer S> ? S : never;

type UnionRouteMatches<R> = R extends AnyRoute ? Match<R> : never;
type UnionHistoryActions<R> = R extends AnyRoute ? HistoryAction<R> : never;

export type Match<R> = R extends Route<infer P, infer S>
  ? {
    route: R,
    params: P,
    state: S,
  }
  : never;

export type HistoryAction<R extends AnyRoute = AnyRoute> = Match<R> & {
  method: 'push' | 'replace';
  hash?: string;
  search?: string;
};

export type AnyHistoryAction = UnionHistoryActions<AnyRoute>;

export type reducer = (state: State, action: AnyAction) => State;

export interface RouteParamsType {
  [key: string]: string | RouteParamsType;
}
export interface RouteStateType {
  [key: string]: any;
}

export interface Route<
  P extends RouteParamsType = {},
  // @ts-ignore: 'S' is declared but its value is never read.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  S extends RouteStateType = {}
> {
  name: string;
  paths: string[];
  getUrl: (p: P) => string;
  getSearch?: (p: P) => string;
  component: ComponentType;
  locale?: string;
}

export interface LocationChange<M = AnyMatch> {
  location: Location;
  match?: M;
  action: Action;
}

export type AnyRoute = typeof routes[number];
export type AnyMatch = UnionRouteMatches<AnyRoute>;

export type RouteHookBody<R extends AnyRoute> = (helpers: MiddlewareAPI & AppServices) =>
  (locationChange: Required<LocationChange<Match<R>>>) =>
    Promise<any> | void;

export interface ScrollTarget {
  type: string;
  elementId: string;
  [key: string]: unknown;
}
