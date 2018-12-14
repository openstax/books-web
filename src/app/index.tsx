import { createBrowserHistory, createMemoryHistory } from 'history';
import React from 'react';
import { addLocaleData, IntlProvider } from 'react-intl';
import en from 'react-intl/locale-data/en';
import cs from 'react-intl/locale-data/cs';
import { Provider } from 'react-redux';
import { combineReducers } from 'redux';
import createStore from '../helpers/createStore';
import FontCollector from '../helpers/FontCollector';
import PromiseCollector from '../helpers/PromiseCollector';
import * as content from './content';
import * as Services from './context/Services';
import * as errors from './errors';
import * as head from './head';
import * as navigation from './navigation';
import { hasState } from './navigation/guards';
import { AnyMatch } from './navigation/types';
import { matchUrl } from './navigation/utils';
import { AnyAction, AppServices, AppState, Middleware } from './types';

export const actions = {
  content: content.actions,
  errors: errors.actions,
  head: head.actions,
  navigation: navigation.actions,
};

export const routes = [
  ...Object.values(content.routes),
  ...Object.values(errors.routes),
];

const hooks = [
  ...Object.values(content.hooks),
  ...Object.values(head.hooks),
];

const defaultServices = () => ({
  fontCollector: new FontCollector(),
  promiseCollector: new PromiseCollector(),
});

interface Options {
  initialState?: AppState;
  initialEntries?: AnyMatch[];
  services: Pick<AppServices, Exclude<keyof AppServices, keyof ReturnType<typeof defaultServices>>>;
}

export default (options: Options) => {
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

  const reducer = combineReducers<AppState, AnyAction>({
    content: content.reducer,
    errors: errors.reducer,
    head: head.reducer,
    navigation: navigation.createReducer(history.location),
  });

  const services = {
    ...defaultServices(),
    ...options.services,
  };

  const middleware: Middleware[] = [
    navigation.createMiddleware(routes, history),
    ...hooks.map((hook) => hook(services)),
  ];

  const store = createStore({
    initialState,
    middleware,
    reducer,
  });

  const language = (typeof window === 'undefined') ? 'en-us' : window.navigator.language;
  addLocaleData([...en, ...cs]);

  const messages = new Map()
  messages.set('en', { 'i18n:404': 'page not found' });
  messages.set('cs', { 'i18n:404': 'požadovaná stránka neexistuje'});

  function getMessages(language: string) {
      const lang = language.split('-')[0]
      return messages.get(lang) || messages.get('en')
  }

  const container = () => <Provider store={store}>
  <IntlProvider locale={language} messages={getMessages(language)}>
    <Services.Provider value={services} >
      <navigation.components.NavigationProvider routes={routes} />
    </Services.Provider>
  </IntlProvider>
  </Provider>;

  if (!initialState) {
    navigation.utils.init(routes, history.location, store.dispatch);
  }

  return {
    container,
    history,
    services,
    store,
  };
};
