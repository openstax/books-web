import {
  applyMiddleware,
  compose,
  createStore,
  Middleware,
  Reducer,
  StoreEnhancerStoreCreator
} from 'redux';
import { AnyAction, AppState, Store } from '../app/types';
import config from '../config';

interface Options {
  reducer: Reducer<AppState, AnyAction>;
  middleware: Middleware[];
  initialState?: Partial<AppState>;
}

export default function({middleware, reducer, initialState}: Options): Store {
  const composeEnhancers = (
    config.DEBUG
    && typeof window !== 'undefined'
    && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  )
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose;

  const enhancers = [
    applyMiddleware(...middleware),
  ];

  const enhancer = composeEnhancers<StoreEnhancerStoreCreator<{}, {}>>(...enhancers);
  const store = createStore(reducer, initialState, enhancer);

  return store;
}
