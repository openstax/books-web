import { Ref } from 'react';
import scrollToElement from 'scroll-to-element';
import { getType } from 'typesafe-actions';
import {
  ActionHookBody,
  AnyAction,
  AnyActionCreator,
  AppServices,
  Dispatch,
  Middleware
} from './types';

export const checkActionType = <C extends AnyActionCreator>(actionCreator: C) =>
  (action: AnyAction): action is ReturnType<C> => action.type === getType(actionCreator);

export const actionHook = <C extends AnyActionCreator>(actionCreator: C, body: ActionHookBody<C>) =>
  (services: AppServices): Middleware => (stateHelpers) => {
    const boundHook = body({...stateHelpers, ...services});

    const matches = checkActionType(actionCreator);

    return (next: Dispatch) => (action: AnyAction) => {
      const result = next(action);

      if (matches(action)) {
        const promise = boundHook(action);

        if (promise) {
          services.promiseCollector.add(promise);
        }
      }

      return result;
    };
  };

// from https://github.com/facebook/react/issues/13029#issuecomment-445480443
export const mergeRefs = <T>(...refs: Array<Ref<T> | undefined>) => (ref: T) => {
  refs.forEach((resolvableRef) => {
    if (typeof resolvableRef === 'function') {
      resolvableRef(ref);
    } else if (resolvableRef) {
      (resolvableRef as any).current = ref;
    }
  });
};

/*
 * util for dealing with array and object index signatures
 * don't include undefined
 *
 * ref: https://github.com/Microsoft/TypeScript/issues/13778
 */
export const assertDefined = <X>(x: X, message: string) => {
  if (x === undefined) {
    throw new Error(message);
  }

  return x!;
};

export const assertString = <X>(x: X, message: string): string => {
  if (typeof x !== 'string') {
    throw new Error(message);
  }

  return x;
};

export const assertWindow = (message: string = 'BUG: Window is undefined') => {
  if (typeof(window) === 'undefined') {
    throw new Error(message);
  }

  return window;
};

export const assertDocument = (message: string = 'BUG: Document is undefined') => {
  if (typeof(document) === 'undefined') {
    throw new Error(message);
  }

  return document;
};

export const assertDocumentElement = (message: string = 'BUG: Document Element is null') => {
  const documentElement = assertDocument().documentElement;

  if (documentElement === null) {
    throw new Error(message);
  }

  return documentElement;
};

export const scrollTo = (elem: Element | string) => {
  const body = assertDocument().body;
  const padding = body.getAttribute('data-scroll-padding') || '0';
  const offset = parseFloat(padding) || 0;
  return scrollToElement(elem, {offset});
};

export const remsToPx = (rems: number) => {
  const bodyFontSize = typeof(window) === 'undefined'
    ? 10
    : parseFloat(window.getComputedStyle(window.document.body).fontSize || '') || 10;

  return rems * bodyFontSize;
};
