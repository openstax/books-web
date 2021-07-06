import queryString from 'query-string';
import React from 'react';
import ReactDOM from 'react-dom';
import Loadable from 'react-loadable';
import createApp from './app';
import { onPageFocusChange } from './app/domUtils';
import createIntl from './app/messages/createIntl';
import { updateAvailable } from './app/notifications/actions';
import { assertDefined, assertWindow } from './app/utils';
import config from './config';
import './content.css';
import createArchiveLoader from './gateways/createArchiveLoader';
import createBookConfigLoader from './gateways/createBookConfigLoader';
import createBuyPrintConfigLoader from './gateways/createBuyPrintConfigLoader';
import createHighlightClient from './gateways/createHighlightClient';
import createOSWebLoader from './gateways/createOSWebLoader';
import createPracticeQuestionsLoader from './gateways/createPracticeQuestionsLoader';
import createSearchClient from './gateways/createSearchClient';
import createUserLoader from './gateways/createUserLoader';
import { registerGlobalAnalytics } from './helpers/analytics';
import loadFont from './helpers/loadFont';
import loadOptimize from './helpers/loadOptimize';
import { startMathJax } from './helpers/mathjax';
import pollUpdates from './helpers/pollUpdates';
import Sentry from './helpers/Sentry';
import './index.css';
import * as serviceWorker from './serviceWorker';

const window = assertWindow('Browser entrypoint must be used in the browser');
const document = window.document;

if (window.top === window.self) {
  const devMessage = [
    `Howdy! If you want to help out, the source code can be found at `,
    `https://github.com/openstax/rex-web`,
  ];
  console.info(`%c` + devMessage.join(''), 'font-weight:bold'); // tslint:disable-line:no-console
}

const archiveUrl = config.REACT_APP_ARCHIVE_URL_OVERRIDE ||
  assertDefined(config.REACT_APP_ARCHIVE_URL, 'REACT_APP_ARCHIVE_URL must be defined');

const osWebUrl = assertDefined(config.REACT_APP_OS_WEB_API_URL, 'REACT_APP_OS_WEB_API_URL must be defined');
const accountsUrl = assertDefined(config.REACT_APP_ACCOUNTS_URL, 'REACT_APP_ACCOUNTS_URL must be defined');
const searchUrl = assertDefined(config.REACT_APP_SEARCH_URL, 'REACT_APP_SEARCH_URL must be defined');
const highlightsUrl = assertDefined(config.REACT_APP_HIGHLIGHTS_URL, 'REACT_APP_HIGHLIGHTS_URL must be defined');
const buyPrintConfigUrl = assertDefined(
  config.REACT_APP_BUY_PRINT_CONFIG_URL,
  'REACT_APP_BUY_PRINT_CONFIG_URL must be defined'
);
const mainContent = document.getElementById('main-content');

const app = createApp({
  initialState: window.__PRELOADED_STATE__,
  services: {
    archiveLoader: createArchiveLoader(archiveUrl),
    bookConfigLoader: createBookConfigLoader(),
    buyPrintConfigLoader: createBuyPrintConfigLoader(buyPrintConfigUrl),
    config,
    highlightClient: createHighlightClient(highlightsUrl),
    intl: createIntl(),
    osWebLoader: createOSWebLoader(osWebUrl),
    practiceQuestionsLoader: createPracticeQuestionsLoader(),
    prerenderedContent: mainContent ? mainContent.innerHTML : undefined,
    searchClient: createSearchClient(searchUrl),
    userLoader: createUserLoader(accountsUrl),
  },
});

// bind this to the window so profiling tools can access it
window.__APP_STORE = app.store;
window.__APP_SERVICES = app.services;
window.__APP_ASYNC_HOOKS = app.services.promiseCollector;

app.services.fontCollector.handle((font) => {
  app.services.promiseCollector.add(loadFont(font));
});

app.services.promiseCollector.calm().then(() => {
  if (typeof(document) !== 'undefined') {
    document.body.setAttribute('data-rex-loaded', 'true');
  }
});

if (window.__PRELOADED_STATE__) {
  Loadable.preloadReady().then(() => {
    ReactDOM.hydrate(<app.container />, document.getElementById('root'), doneRendering);
  });
} else {
  ReactDOM.render(<app.container />, document.getElementById('root'), doneRendering);
}

function doneRendering() {
  const initialActions = queryString.parse(window.location.search).initialActions;
  if (typeof(initialActions) === 'string') {
    const actions = JSON.parse(initialActions);
    actions.forEach((action: any) => app.store.dispatch(action));
  }
}

window.onblur = onPageFocusChange(false, app);
window.onfocus = onPageFocusChange(true, app);

window.__APP_ANALYTICS = registerGlobalAnalytics(window, app.store);

// start long running processes
pollUpdates(app.store);
startMathJax();

// load optimize
loadOptimize(window, app.store);

// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register()
  .then((registration) => {
    app.services.serviceWorker = registration;

    if (!window.navigator.serviceWorker.controller) {
      return;
    }

    if (registration && (registration.waiting || registration.installing)) {
      app.store.dispatch(updateAvailable());
    } else if (registration) {
      // For Chrome and Edge registration.waiting and registration.installing
      // is still null for some time after .register()
      registration.addEventListener('updatefound', () => {
        app.store.dispatch(updateAvailable());
      });
    }
  })
  .catch((e) => {
    Sentry.captureException(e);
  });
