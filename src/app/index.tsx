import { createBrowserHistory, createMemoryHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import config from '../config';
import createStore from '../helpers/createStore';
import FontCollector from '../helpers/FontCollector';
import PromiseCollector from '../helpers/PromiseCollector';
import Sentry from '../helpers/Sentry';
import * as auth from './auth';
import * as content from './content';
import * as Services from './context/Services';
import * as developer from './developer';
import * as errors from './errors';
import ErrorBoundary from './errors/components/ErrorBoundary';
import * as head from './head';
import MessageProvider from './MessageProvider';
import * as navigation from './navigation';
import { hasState } from './navigation/guards';
import { AnyMatch } from './navigation/types';
import { matchUrl } from './navigation/utils';
import * as notifications from './notifications';
import createReducer from './reducer';
import { AppServices, AppState, Middleware } from './types';

export const actions = {
  auth: auth.actions,
  content: content.actions,
  errors: errors.actions,
  head: head.actions,
  navigation: navigation.actions,
  notifications: notifications.actions,
};

export const routes = [
  ...(
    process.env.REACT_APP_ENV !== 'production'
      ? Object.values(developer.routes)
      : /* istanbul ignore next */ []
  ),
  ...Object.values(content.routes),
  ...Object.values(errors.routes),
];

const init = [
  ...Object.values(auth.init),
];

const hooks = [
  ...content.hooks,
  ...Object.values(head.hooks),
  ...Object.values(notifications.hooks),
  ...Object.values(auth.hooks),
];

const defaultServices = () => ({
  fontCollector: new FontCollector(),
  promiseCollector: new PromiseCollector(),
});

export interface AppOptions {
  initialState?: Partial<AppState>;
  initialEntries?: AnyMatch[];
  services: Pick<AppServices, Exclude<keyof AppServices, 'history' | keyof ReturnType<typeof defaultServices>>>;
}

export default (options: AppOptions) => {
  const {initialEntries, initialState} = options;

  const history = typeof window !== 'undefined' && window.history
    ? createBrowserHistory()
    : createMemoryHistory(initialEntries && {
      initialEntries: initialEntries.map(matchUrl),
    });

  if (initialEntries && initialEntries.length > 0) {
    const entry = initialEntries[initialEntries.length - 1];
    if (hasState(entry)) {
      history.location.state = entry.state;
    }
  }

  const reducer = createReducer(history);

  const services = {
    ...defaultServices(),
    ...options.services,
    history,
  };

  const middleware: Middleware[] = [
    navigation.createMiddleware(routes, history),
    ...hooks.map((hook) => hook(services)),
  ];

  if (config.SENTRY_ENABLED) {
    middleware.push(Sentry.initializeWithMiddleware());
  }

  const store = createStore({
    initialState,
    middleware,
    reducer,
  });

  const container = () => (
    <Provider store={store}>
      <ErrorBoundary>
        <MessageProvider>
          <Services.Provider value={services} >
            <navigation.components.NavigationProvider routes={routes} />
          </Services.Provider>
        </MessageProvider>
      </ErrorBoundary>
    </Provider>
  );

  navigation.utils.changeToLocation(routes, store.dispatch, history.location, 'POP');

  for (const initializer of init) {
    const promise = initializer({
      dispatch: store.dispatch,
      getState: store.getState,
      ...services,
    });

    services.promiseCollector.add(promise);
  }

  return {
    container,
    history,
    services,
    store,
  };
};
