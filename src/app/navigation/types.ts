import { Location } from 'history';
import { ComponentType } from 'react';
import { routes } from '../';
import { AnyAction } from '../types';

export type State = Location;

type RouteParams<R> = R extends Route<infer P> ? P : never;
type UnionRouteMatches<R> = R extends AnyRoute ? Match<R> : never;

interface MatchWithParams<R extends AnyRoute> {
  route: R;
  params: RouteParams<R>;
}
interface MatchWithoutParams<R extends AnyRoute> {
  route: R;
}

export type GenericMatch = MatchWithParams<AnyRoute> | MatchWithoutParams<AnyRoute>;

export type Match<R extends AnyRoute> = RouteParams<R> extends undefined
  ? MatchWithoutParams<R> | MatchWithParams<R>
  : MatchWithParams<R>;

export type historyActions =
  {method: 'push', url: string} |
  {method: 'replace', url: string};

export type reducer = (state: State, action: AnyAction) => State;

export interface Route<Params> {
  name: string;
  paths: string[];
  getUrl: (...args: Params extends undefined ? []: [Params]) => string;
  component: ComponentType;
}

export interface LocationChange {
  location: Location;
  match?: AnyMatch;
}

export type AnyRoute = typeof routes[number];
export type AnyMatch = UnionRouteMatches<AnyRoute>;
