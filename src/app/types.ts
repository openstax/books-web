import { ServiceWorkerRegistration } from '@openstax/types/lib.dom';
import { History } from 'history';
import { IntlShape } from 'react-intl';
import {
  Dispatch as ReduxDispatch,
  Middleware as ReduxMiddleware,
  MiddlewareAPI as ReduxMiddlewareAPI,
  Store as ReduxStore,
} from 'redux';
import { ActionType } from 'typesafe-actions';
import { actions } from '.';
import createArchiveLoader from '../gateways/createArchiveLoader';
import createBuyPrintConfigLoader from '../gateways/createBuyPrintConfigLoader';
import createHighlightClient from '../gateways/createHighlightClient';
import createOSWebLoader from '../gateways/createOSWebLoader';
import createPracticeQuestionsLoader from '../gateways/createPracticeQuestionsLoader';
import createSearchClient from '../gateways/createSearchClient';
import createUserLoader from '../gateways/createUserLoader';
import analytics from '../helpers/analytics';
import FontCollector from '../helpers/FontCollector';
import PromiseCollector from '../helpers/PromiseCollector';
import { State as authState } from './auth/types';
import { State as contentState } from './content/types';
import { State as errorsState } from './errors/types';
import { State as headState } from './head/types';
import { State as navigationState } from './navigation/types';
import { State as notificationState } from './notifications/types';

export interface AppState {
  content: contentState;
  errors: errorsState;
  head: headState;
  auth: authState;
  navigation: navigationState;
  notifications: notificationState;
}

export interface AppServices {
  analytics: typeof analytics;
  archiveLoader: ReturnType<typeof createArchiveLoader>;
  buyPrintConfigLoader: ReturnType<typeof createBuyPrintConfigLoader>;
  fontCollector: FontCollector;
  highlightClient: ReturnType<typeof createHighlightClient>;
  history: History;
  intl: IntlShape;
  osWebLoader: ReturnType<typeof createOSWebLoader>;
  practiceQuestionsLoader: ReturnType<typeof createPracticeQuestionsLoader>;
  prerenderedContent?: string;
  promiseCollector: PromiseCollector;
  searchClient: ReturnType<typeof createSearchClient>;
  serviceWorker?: ServiceWorkerRegistration;
  userLoader: ReturnType<typeof createUserLoader>;
}

type ActionCreator<T extends string = string> = (...args: any[]) => { type: T };
type ActionCreatorMap<T> = { [K in keyof T]: FlattenedActionMap<T[K]> };

type FlattenedActionMap<ActionCreatorOrMap> = ActionCreatorOrMap extends ActionCreator
  ? ActionCreatorOrMap
  : ActionCreatorOrMap extends object
    ? ActionCreatorMap<ActionCreatorOrMap>[keyof ActionCreatorOrMap]
    : never;

export type AnyActionCreator = FlattenedActionMap<typeof actions>;
export type AnyAction = ActionType<typeof actions>;

// bound redux stuff
export type Dispatch = ReduxDispatch<AnyAction>;
export type Middleware = ReduxMiddleware<{}, AppState, Dispatch>;
export type MiddlewareAPI = ReduxMiddlewareAPI<Dispatch, AppState>;
export type Store = ReduxStore<AppState, AnyAction>;

export type Initializer = (helpers: MiddlewareAPI & AppServices) => Promise<any>;

export type ActionHookBody<C extends AnyActionCreator> = (helpers: MiddlewareAPI & AppServices) =>
  (action: ReturnType<C>) => Promise<any> | void;

// helpers
export type ArgumentTypes<F> = F extends (...args: infer A) => any ? A : never;
export type FirstArgumentType<F> = F extends (first: infer A, ...args: any) => any ? A : never;
export type Unpromisify<F> = F extends Promise<infer T> ? T : never;
