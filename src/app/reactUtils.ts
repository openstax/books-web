import { FocusEvent, HTMLElement, HTMLElementEventMap,
  KeyboardEvent, MediaQueryListEvent } from '@openstax/types/lib.dom';
import React from 'react';
import { addSafeEventListener } from './domUtils';
import { isElement, isWindow } from './guards';
import theme from './theme';
import { assertDefined, assertDocument, assertWindow } from './utils';

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

    if (!isElement(relatedTarget) || !ref.current!.contains(relatedTarget)) {
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

export const onDOMEventHandler = (
  element: React.RefObject<HTMLElement> | Window,
  isEnabled: boolean,
  event: keyof HTMLElementEventMap,
  cb: () => void
) => () => {
  const target = isWindow(element) ? element : element.current;

  if (!target) { return; }

  if (isEnabled) {
    target.addEventListener(event, cb);
  }

  return () => target.removeEventListener(event, cb);
};

export const useOnDOMEvent = (
  element: React.RefObject<HTMLElement> | Window ,
  isEnabled: boolean,
  event: keyof HTMLElementEventMap,
  cb: () => void,
  deps: React.DependencyList = []
) => {
  React.useEffect(onDOMEventHandler(element, isEnabled, event, cb), [element, isEnabled, event, cb, ...deps]);
};

export const useTimeout = (delay: number, callback: () => void) => {
  const savedCallback = React.useRef<typeof callback>();
  const timeout = React.useRef<number>();

  const timeoutHandler = () => savedCallback.current && savedCallback.current();
  const reset = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    timeout.current = setTimeout(timeoutHandler, delay);
  };

  React.useEffect(() => {
    savedCallback.current = callback;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback]);

  React.useEffect(() => {
      reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);

  React.useEffect(() => () => clearTimeout(assertDefined(timeout.current, 'timeout ID can\'t be undefined')), []);

  return reset;
};

/**
 * This function will return array where first item is a function which will set
 * event listener for given element and second item is a function which will remove
 * this listener.
 *
 * This function can be used in React class components.
 */
export const onEsc = (
  element: HTMLElement, cb: () => void
): [() => void, () => void] => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      cb();
    }
  };

  return [
    () => element.addEventListener('keydown', handler),
    () => element.removeEventListener('keydown', handler),
  ];
};

export const onEscHandler = (element: React.RefObject<HTMLElement>, isEnabled: boolean, cb: () => void) => () => {
  const el = element && element.current;
  if (!el) { return; }

  const [addEvListener, removeEvListener] = onEsc(el, cb);
  if (isEnabled) {
    addEvListener();
  }

  return removeEvListener;
};

export const useOnEsc = (element: React.RefObject<HTMLElement>, isEnabled: boolean, cb: () => void) => {
  React.useEffect(onEscHandler(element, isEnabled, cb), [element, isEnabled, cb]);
};

export const useMatchMobileQuery = () => {
  const matchMedia = assertWindow().matchMedia(theme.breakpoints.mobileQuery);
  const [isMobile, setIsMobile] = React.useState(matchMedia.matches);

  const listener = React.useCallback((e: EventListener) => {
    if ((e as MediaQueryListEvent).matches) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  }, []);

  React.useEffect(() => {
    matchMedia.addListener(listener);
    return () => { matchMedia.removeListener(listener); };
  }, [listener, matchMedia]);

  return isMobile;
};

export const useDebouncedWindowSize = () => {
  const window = assertWindow();
  const timeout = React.useRef(0);
  const [size, setSize] = React.useState([window.innerWidth, window.innerHeight]);

  React.useLayoutEffect(() => {
    const updateSize = () => {
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        setSize([window.innerWidth, window.innerHeight]);
      }, 50);
    };
    window.addEventListener('resize', updateSize);
    return () => {
      clearTimeout(timeout.current);
      window.removeEventListener('resize', updateSize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return size;
};

export const useOnScrollTopOffset = () => {
  const document = assertDocument();
  const [topOffset, setTopOffset] = React.useState(0);

  const listener = React.useCallback(() => {
    setTopOffset(document.scrollingElement ? document.scrollingElement.scrollTop : 0);
  }, [document]);

  React.useEffect(() => {
    document.addEventListener('scroll', listener);
    return () => { document.removeEventListener('scroll', listener); };
  }, [document, listener]);

  return topOffset;
};

const tabbableElementsSelector = [
  'a[href]',
  'area[href]',
  'audio',
  'button:not([disabled])',
  'details',
  'embed',
  'iframe',
  'input:not([disabled])',
  'select:not([disabled])',
  'summary',
  'textarea:not([disabled])',
  'object',
  // In Firefox elements with overflow: auto / scroll are tabbable if they are scrollable
  // and ToC is one of these elements so we add `ol` to this list.
  'ol',
  'video',
  '[contentEditable=true]',
  '[tabindex]',
].map((el) => el + `:not([tabindex='-1'])`).join(',');

export const disableContentTabbingHandler = () => {
  const root = assertDocument().querySelector('#root');
  if (!root) { return; }

  root.setAttribute('aria-hidden', 'true');
  const tabbable = root.querySelectorAll(tabbableElementsSelector);

  tabbable.forEach((el) => {
    const currentTabIndex = el.getAttribute('tabindex');
    el.setAttribute('tabindex', '-1');
    if (currentTabIndex) {
      el.setAttribute('data-prev-tabindex', currentTabIndex);
    }
  });

  return () => {
    root.removeAttribute('aria-hidden');
    tabbable.forEach((el) => {
      const prevTabIndex = el.getAttribute('data-prev-tabindex');
      if (prevTabIndex) {
        el.setAttribute('tabindex', prevTabIndex);
        el.removeAttribute('data-prev-tabindex');
      } else {
        el.removeAttribute('tabindex');
      }
    });
  };
};

export const useDisableContentTabbing = () => React.useEffect(disableContentTabbingHandler);
