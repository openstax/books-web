import { AppState } from '../app/types';
import cs from './createStore';

declare const window: Window;

describe('createStore', () => {
  let redux = require('redux');

  afterEach(() => {
    jest.resetModules();
    redux = require('redux');
  });

  describe('outside production', () => {
    let createStore: typeof cs;
    let compose: jest.SpyInstance;

    beforeEach(() => {
      process.env.ENVIRONMENT = 'development';
      compose = jest.spyOn(redux, 'compose');
      createStore = require('./createStore').default;
    });

    it('composes without devtools if they\'re not defined', () => {
      createStore({
        initialState: {} as AppState,
        middleware: [],
        reducer: () => ({} as AppState),
      });

      expect(compose).toHaveBeenCalled();
    });

    it('composes with devtools if they\'re defined', () => {
      const differentCompose = () => (<R>(r: R) => r) as typeof redux.compose;
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = differentCompose;

      const devtools = jest.spyOn(window, '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__');

      createStore({
        initialState: {} as AppState,
        middleware: [],
        reducer: () => ({} as AppState),
      });

      expect(devtools).toHaveBeenCalled();
      expect(compose).not.toHaveBeenCalled();
    });
  });

  describe('in production', () => {
    let createStore: typeof cs;
    let compose: jest.SpyInstance;

    beforeEach(() => {
      process.env.ENVIRONMENT = 'production';
      compose = jest.spyOn(redux, 'compose');
      createStore = require('./createStore').default;
    });

    it('composes without devtools', () => {
      createStore({
        initialState: {} as AppState,
        middleware: [],
        reducer: () => ({} as AppState),
      });

      expect(compose).toHaveBeenCalled();
    });

    it('composes without devtools even if they\'re defined', () => {
      const differentCompose = () => (<R>(r: R) => r) as typeof redux.compose;
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = differentCompose;

      const devtools = jest.spyOn(window, '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__');

      createStore({
        initialState: {} as AppState,
        middleware: [],
        reducer: () => ({} as AppState),
      });

      expect(devtools).not.toHaveBeenCalled();
      expect(compose).toHaveBeenCalled();
    });
  });
});

export default undefined;
