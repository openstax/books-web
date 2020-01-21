import React, { Ref } from 'react';
import { getType } from 'typesafe-actions';
import Sentry from '../helpers/Sentry';
import { recordError } from './errors/actions';

import { Document } from '@openstax/types/lib.dom';
import { isPlainObject } from './guards';
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
        const catchError = (error: Error) => {
          Sentry.captureException(error);
          stateHelpers.dispatch(recordError({error}));
        };
        try {
          const promise = boundHook(action);
          if (promise) {
            services.promiseCollector.add(promise.catch(catchError));
          }
        } catch (e) {
          catchError(e);
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

export const remsToEms = (rems: number) => rems * 10 / 16;

export const remsToPx = (rems: number) => {
  const bodyFontSize = typeof(window) === 'undefined'
    ? 10
    : parseFloat(window.getComputedStyle(window.document.body).fontSize || '') || 10;

  return rems * bodyFontSize;
};

export const getAllRegexMatches = (regex: RegExp) => {
  if (!regex.global) {
    throw new Error('getAllRegexMatches must be used with the global flag');
  }

  return (string: string) => {
    const matches: RegExpExecArray[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(string)) ) { // tslint:disable-line:no-conditional-assignment
      matches.push(match);
    }
    return matches;
  };
};

export const resetTabIndex = (document: Document) => {
  const index = document.body.tabIndex;
  document.body.tabIndex = 0;

  document.body.focus();
  document.body.tabIndex = index;
};

export const preventDefault = (event: React.MouseEvent) => {
  event.preventDefault();
  return event;
};

export const getCommonProperties = <T1 extends {}, T2 extends {}>(thing1: T1, thing2: T2) =>
  Object.keys(thing1).filter((key) => Object.keys(thing2).includes(key)) as Array<keyof T1 & keyof T2>;

/*
 * recursive merge properties of two inputs. values are merged if they are
 * plain objects or arrays, otherwise if the same property exists in both
 * objects the value from the second argument will win.
 *
 * unlike lodash merge, this will not change object references for values that
 * exist only in one parameter.
 */
export const merge = <T1 extends {}, T2 extends {}>(thing1: T1, thing2: T2): T1 & T2 => ({
  ...thing1,
  ...thing2,
  ...getCommonProperties(thing1, thing2).reduce((result, property) => ({
    ...result,
    ...(isPlainObject(thing1[property]) && isPlainObject(thing2[property])
      ? {[property]: merge(thing1[property], thing2[property])}
      : (Array.isArray(thing1[property]) && Array.isArray(thing2[property]))
        ? {[property]: [...thing1[property] as unknown as [], ...thing2[property] as unknown as []]}
        : {}
    ),
  }), {}),
});
