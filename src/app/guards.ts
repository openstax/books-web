import { HTMLElement } from '@openstax/types/lib.dom';

export const isHtmlElement = (thing: any): thing is HTMLElement =>
  typeof thing === 'object'
  && thing !== null
  && thing.nodeType === 1
  && thing.title !== undefined
  && typeof thing.nodeName === 'string'
;
