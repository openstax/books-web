/// <reference lib="es2017" />
/// <reference lib="es2017.object" />
import * as dom from '@openstax/types/lib.dom';
import { compose } from 'redux';
import PromiseCollector from './helpers/PromiseCollector';

declare global {

  interface Window extends dom.Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: typeof compose;
    __RENDERING_HOOKS: PromiseCollector
  }

  var fetch: (input: dom.RequestInfo, init?: dom.RequestInit) => Promise<Response>;
  var window: Window | undefined;
  var document: dom.Document | undefined;
  var navigator: dom.Navigator | undefined;
  var URL: dom.URLConstructor | undefined;
}
