import queryString from 'query-string';
import React from 'react';
import ReactDOM from 'react-dom';
import Loadable from 'react-loadable';
import createApp from './app';
import { assertDefined, assertWindow } from './app/utils';
import config from './config';
import './content.css';
import createArchiveLoader from './gateways/createArchiveLoader';
import createOSWebLoader from './gateways/createOSWebLoader';
import createSearchClient from './gateways/createSearchClient';
import createUserLoader from './gateways/createUserLoader';
import loadFont from './helpers/loadFont';
import { startMathJax } from './helpers/mathjax';
import pollUpdates from './helpers/pollUpdates';
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

const archiveUrl = assertDefined(config.REACT_APP_ARCHIVE_URL, 'REACT_APP_ARCHIVE_URL must be defined');
if (!config.REACT_APP_OS_WEB_API_URL) { throw new Error('REACT_APP_OS_WEB_API_URL must be defined'); }
const accountsUrl = assertDefined(config.REACT_APP_ACCOUNTS_URL, 'REACT_APP_ACCOUNTS_URL must be defined');
const searchUrl = assertDefined(config.REACT_APP_SEARCH_URL, 'REACT_APP_SEARCH_URL must be defined');
const mainContent = document.getElementById('main-content');

const app = createApp({
  initialState: window.__PRELOADED_STATE__,
  services: {
    archiveLoader: createArchiveLoader(archiveUrl),
    osWebLoader: createOSWebLoader(config.REACT_APP_OS_WEB_API_URL),
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

// start long running processes
pollUpdates(app.store);
startMathJax();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
