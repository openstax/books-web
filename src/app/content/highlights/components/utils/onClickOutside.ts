import { EventListenerOptions, HTMLElement, MouseEvent } from '@openstax/types/lib.dom';
import React from 'react';
import { assertDocument, assertWindow } from '../../../../utils';

const onClickOutside = (
  element: React.RefObject<HTMLElement>,
  isFocused: boolean,
  cb: (ev: MouseEvent) => void,
  eventOptions?: EventListenerOptions
) => () => {
  if (typeof document === 'undefined') {
    return () => null;
  }

  const ifOutside = (e: MouseEvent) => {
    if (!(e.target instanceof assertWindow().Element)) {
      return;
    }
    if (!element.current || element.current.contains(e.target)) {
      return;
    }
    cb(e);
  };

  if (isFocused) {
    document.addEventListener('click', ifOutside, eventOptions);
  }

  return () => assertDocument().removeEventListener('click', ifOutside, eventOptions);
};

export const useOnClickOutside = (
  element: React.RefObject<HTMLElement>,
  isEnabled: boolean,
  cb: (e: MouseEvent) => void,
  eventOptions?: EventListenerOptions
) => {
  React.useEffect(onClickOutside(element, isEnabled, cb, eventOptions), [isEnabled]);
};

export default onClickOutside;
