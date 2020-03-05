import { FocusEvent, HTMLElement, HTMLElementEventMap } from '@openstax/types/lib.dom';
import React from 'react';
import { addSafeEventListener, elementDescendantOf } from './domUtils';
import { isElement, isWindow } from './guards';

export const useDrawFocus = <E extends HTMLElement = HTMLElement>() => {
  const ref = React.useRef<E | null>(null);

  React.useEffect(() => {
    if (ref && ref.current) {
      ref.current.focus();
    }
  }, [ref]);

  return ref;
};

export const onFocusLostHandler = (ref: React.RefObject<HTMLElement>, isEnabled: boolean, cb: () => void) => () => {
  const el = ref && ref.current;
  if (!el) { return; }

  const handler = (event: FocusEvent) => {
    const relatedTarget = event.relatedTarget;

    if (!isElement(relatedTarget) || !elementDescendantOf(relatedTarget, ref.current!)) {
      cb();
    }
  };

  if (isEnabled) {
    return addSafeEventListener(el, 'focusout', handler);
  }
};

export const useFocusLost = (ref: React.RefObject<HTMLElement>, isEnabled: boolean, cb: () => void) => {
  React.useEffect(onFocusLostHandler(ref, isEnabled, cb), [ref, isEnabled]);
};

export const useOnDOMEvent = (
  element: React.RefObject<HTMLElement> | Window ,
  isEnabled: boolean,
  event: keyof HTMLElementEventMap,
  cb: () => void
) => {
  React.useEffect(() => {
    const target = isWindow(element) ? element : element.current;

    if (!target) { return; }

    if (isEnabled) {
      target.addEventListener(event, cb);
    }

    return () => target.removeEventListener(event, cb);
  }, [element, isEnabled, cb, event]);
};

export const useTimeout = (delay: number, cb: () => void, deps: React.DependencyList) => React.useEffect(() => {
  const timeout = setTimeout(cb, delay);
  return () => clearTimeout(timeout);
  // eslint-disabled-next-line react-hooks/exhaustive-deps
}, [...deps, cb, delay]);
