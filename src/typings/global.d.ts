/// <reference lib="es2017" />
/// <reference lib="es2017.object" />
import * as dom from '@openstax/types/lib.dom';
import { compose } from 'redux';
import { AppServices, AppState, Store } from '../app/types';
import { registerGlobalAnalytics } from '../helpers/analytics';
import PromiseCollector from '../helpers/PromiseCollector';

declare global {

  interface Window extends dom.Window {
    __PRELOADED_STATE__?: Partial<AppState>;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: typeof compose;
    __APP_STORE: Store;
    __APP_SERVICES: AppServices;
    __APP_ASYNC_HOOKS: PromiseCollector;
    __APP_ANALYTICS: ReturnType<registerGlobalAnalytics>;

    HTMLAnchorElement: {
      prototype: dom.HTMLAnchorElement;
      new(): dom.HTMLAnchorElement;
    };
    HTMLButtonElement: {
      prototype: dom.HTMLButtonElement;
      new(): dom.HTMLButtonElement;
    };
    HTMLDetailsElement: {
      prototype: dom.HTMLDetailsElement;
      new(): dom.HTMLDetailsElement;
    };
    HTMLInputElement: {
      prototype: dom.HTMLInputElement;
      new(): dom.HTMLInputElement;
    };
    Element: {
      prototype: dom.Element;
      new(): dom.Element;
    };
    Node: {
      prototype: dom.Node;
      new(): dom.Node;
    };
    CustomEvent: {
      prototype: CustomEvent;
      new<T>(typeArg: string, eventInitDict?: CustomEventInit<T>): CustomEvent<T>;
    };
    FocusEvent: {
      prototype: dom.FocusEvent;
      new(typeArg: string, eventInitDict?: dom.FocusEventInit): dom.FocusEvent;
    };
    Event: {
      prototype: Event;
      new<T>(typeArg: string, eventInitDict?: EventInit<T>): Event<T>;
    };
    MathJax: any;
    ga: UniversalAnalytics.ga;
    dataLayer: object[];
    gtag: (eventKey?: string, eventVal?: string, eventObj?: object) => boolean | void;
  }

  var fetch: (input: dom.RequestInfo, init?: dom.RequestInit) => Promise<Response>;
  var window: Window | undefined;
  var document: dom.Document | undefined;
  var navigator: dom.Navigator | undefined;
  var URL: dom.URLConstructor | undefined;
  // tslint:disable-next-line:variable-name
  var DOMParser: dom.DOMParserConstructor;
  var KeyboardEvent: dom.KeyboardEventConstructor
  var ResizeObserver: dom.ResizeObserverConstructor
}
