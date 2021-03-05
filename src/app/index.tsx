import { createBrowserHistory, createMemoryHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { APP_ENV } from '../config';
import analytics from '../helpers/analytics';
import createStore from '../helpers/createStore';
import { writeFile } from '../helpers/fileUtils';
import FontCollector from '../helpers/FontCollector';
import prepareRedirects from '../helpers/prepareRedirects';
import PromiseCollector from '../helpers/PromiseCollector';
import Sentry from '../helpers/Sentry';
import * as appAactions from './actions';
import * as auth from './auth';
import * as content from './content';
import * as Services from './context/Services';
import * as developer from './developer';
import * as errors from './errors';
import ErrorBoundary from './errors/components/ErrorBoundary';
import * as head from './head';
import MessageProvider from './MessageProvider';
import * as navigation from './navigation';
import { AnyMatch } from './navigation/types';
import { matchPathname } from './navigation/utils';
import * as notifications from './notifications';
import createReducer from './reducer';
import { AppServices, AppState, Middleware } from './types';

export const actions = {
  app: appAactions,
  auth: auth.actions,
  content: content.actions,
  errors: errors.actions,
  head: head.actions,
  navigation: navigation.actions,
  notifications: notifications.actions,
};

export const routes = Object.values({
  ...(
    process.env.REACT_APP_ENV !== 'production'
      ? developer.routes
      : /* istanbul ignore next */ {}
  ),
  ...content.routes,
  ...errors.routes,
});

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
  analytics,
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

  const createMemoryHistoryHelper = () => {
    const memoryHistory = createMemoryHistory(initialEntries && {
      initialEntries: initialEntries.map(matchPathname),
    });

    if (initialEntries && initialEntries[0]) {
      memoryHistory.location.state = initialEntries[0].state;
    }

    return memoryHistory;
  };

  const history = typeof window !== 'undefined' && window.history
    ? createBrowserHistory()
    : createMemoryHistoryHelper();

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

  if (Sentry.shouldCollectErrors) {
    middleware.push(Sentry.initializeWithMiddleware());
  }

  // TODO: This has to be called before app starts, as some kind of script
  // possibile solution is to modify package.json
  if (APP_ENV !== 'production') {
    prepareRedirects(services.archiveLoader, services.osWebLoader, 'redirects.development.json')
      .then((redirects) => {
        writeFile('redirects.development.json', JSON.stringify(redirects, undefined, 2));
      });
  }

  const store = createStore({
    initialState,
    middleware,
    reducer,
  });

  const container = () => (
    <Provider store={store}>
      <MessageProvider>
        <ErrorBoundary>
          <Services.Provider value={services} >
            <navigation.components.NavigationProvider routes={routes} />
          </Services.Provider>
        </ErrorBoundary>
      </MessageProvider>
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
