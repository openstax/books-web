/// <reference lib="es2017" />
/// <reference lib="es2017.object" />
import * as dom from '@openstax/types/lib.dom';
import { compose } from 'redux';
import { AppServices, AppState, Store } from '../app/types';
import PromiseCollector from '../helpers/PromiseCollector';

declare global {

  interface Window extends dom.Window {
    __PRELOADED_STATE__?: Partial<AppState>;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: typeof compose;
    __APP_STORE: Store;
    __APP_SERVICES: AppServices;
    __APP_ASYNC_HOOKS: PromiseCollector;

    HTMLAnchorElement: {
      prototype: dom.HTMLAnchorElement;
      new(): dom.HTMLAnchorElement;
    };
    Element: {
      prototype: dom.Element;
      new(): dom.Element;
    };
    MathJax: any;
  }

  var fetch: (input: dom.RequestInfo, init?: dom.RequestInit) => Promise<Response>;
  var window: Window | undefined;
  var document: dom.Document | undefined;
  var navigator: dom.Navigator | undefined;
  var URL: dom.URLConstructor | undefined;
}
