import { FocusEvent, HTMLElement } from '@openstax/types/lib.dom';
import { Store } from 'redux';
import scrollTo from 'scroll-to-element';
import createTestServices from '../test/createTestServices';
import createTestStore from '../test/createTestStore';
import * as domUtils from './domUtils';
import { onPageFocusChange } from './domUtils';
import { AppServices } from './types';
import { assertDocument, assertWindow } from './utils';

jest.mock('scroll-to-element');

beforeEach(() => {
  jest.resetAllMocks();
});

describe('scrollIntoView', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = assertDocument().createElement('div');
    assertDocument().body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('scrolls up', () => {
    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      bottom: -40,
      top: -50,
    } as any);

    domUtils.scrollIntoView(element);

    expect(scrollTo).toHaveBeenCalledWith(element, expect.anything());
  });

  it('scrolls down', () => {
    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      bottom: assertWindow().innerHeight + 60,
      top: assertWindow().innerHeight + 50,
    } as any);

    domUtils.scrollIntoView(element);

    expect(scrollTo).toHaveBeenCalledWith(element, expect.anything());
  });

  it('noops', () => {
    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      bottom: 0,
      top: 0,
    } as any);

    domUtils.scrollIntoView(element);

    expect(scrollTo).not.toHaveBeenCalledWith(element, expect.anything());
  });

  it('noops if element was not found in the body', () => {
    element.remove();
    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      bottom: assertWindow().innerHeight + 60,
      top: assertWindow().innerHeight + 50,
    } as any);

    domUtils.scrollIntoView(element);

    expect(scrollTo).not.toHaveBeenCalledWith(element, expect.anything());
  });
});

describe('elementDescendantOf', () => {
  const document = assertDocument();

  it('finds ancestor', () => {
    const child = document.createElement('div');
    const parent = document.createElement('div');

    parent.appendChild(child);

    expect(domUtils.elementDescendantOf(child, parent)).toBe(true);
  });

  it('defaults to false if it can\'t find the ancestor', () => {
    const child = document.createElement('div');
    const parent = document.createElement('div');

    expect(domUtils.elementDescendantOf(child, parent)).toBe(false);
  });

  it('defaults to true if the child is the ancestor', () => {
    const child = document.createElement('div');

    expect(domUtils.elementDescendantOf(child, child)).toBe(true);
  });
});

describe('findFirstAncestorOrSelfOfType', () => {
  const document = assertDocument();
  const window = assertWindow();

  it('finds self', () => {
    const child = document.createElement('a');
    const parent = document.createElement('div');

    parent.appendChild(child);

    expect(domUtils.findFirstAncestorOrSelfOfType(child, window.HTMLAnchorElement)).toBe(child);
  });

  it('finds parent', () => {
    const child = document.createElement('span');
    const parent = document.createElement('a');

    parent.appendChild(child);

    expect(domUtils.findFirstAncestorOrSelfOfType(child, window.HTMLAnchorElement)).toBe(parent);
  });

  it('defaults to undefined', () => {
    const child = document.createElement('div');
    const parent = document.createElement('div');

    parent.appendChild(child);

    expect(domUtils.findFirstAncestorOrSelfOfType(child, window.HTMLAnchorElement)).toBeUndefined();
  });
});

describe('findElementSelfOrParent', () => {
  const document = assertDocument();

  it('returns self for elmeent', () => {
    const element = document.createElement('div');
    const result = domUtils.findElementSelfOrParent(element);
    expect(result).toBe(element);
  });

  it('returns parent for non-html element', () => {
    const parent = document.createElement('div');
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    parent.append(element);

    const result = domUtils.findElementSelfOrParent(element);
    expect(result).toBe(parent);
  });

  it('returns undefined if html element can\'t be found', () => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const result = domUtils.findElementSelfOrParent(element);
    expect(result).toBeUndefined();
  });
});

describe('focus on tab change', () => {
  let store: Store;
  let services: AppServices;
  let pageFocus: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore();
    services = createTestServices();
    pageFocus = jest.spyOn(services.analytics.pageFocus, 'track');
  });

  afterEach(() => {
    pageFocus.mockRestore();
  });

  it('reports focusin', async() => {
    onPageFocusChange(true, {services, store})();
    expect(pageFocus).toHaveBeenCalledWith(expect.anything(), true);
  });

  it('reports focusout', () => {
    onPageFocusChange(false, {services, store})();
    expect(pageFocus).toHaveBeenCalledWith(expect.anything(), false);
  });
});

describe('addSafeEventListener', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = assertDocument().createElement('div');
  });

  it('handles matching events', () => {
    const handler = jest.fn<void, [FocusEvent]>();
    let safeHandler: ((e: Event) => void) | undefined;

    jest.spyOn(element, 'addEventListener').mockImplementation((_, add: any) => safeHandler = add);

    domUtils.addSafeEventListener(element, 'focusout', handler);

    if (!safeHandler) {
      return expect(safeHandler).toBeTruthy();
    }

    const event = new (assertWindow().FocusEvent)('focusout');

    safeHandler(event);

    expect(handler).toHaveBeenCalledWith(event);
  });

  it('ignores not matching events', () => {
    const handler = jest.fn<void, [FocusEvent]>();
    let safeHandler: ((e: Event) => void) | undefined;

    jest.spyOn(element, 'addEventListener').mockImplementation((_, add: any) => safeHandler = add);

    domUtils.addSafeEventListener(element, 'focusout', handler);

    if (!safeHandler) {
      return expect(safeHandler).toBeTruthy();
    }

    const event = new (assertWindow().CustomEvent)('asdf');
    safeHandler(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it('returns unbind', () => {
    const handler = jest.fn<void, [FocusEvent]>();
    let safeHandler: ((e: Event) => void) | undefined;

    jest.spyOn(element, 'addEventListener').mockImplementation((_, add: any) => safeHandler = add);
    const remove = jest.spyOn(element, 'removeEventListener');

    const unbind = domUtils.addSafeEventListener(element, 'focusout', handler);

    if (!safeHandler) {
      return expect(safeHandler).toBeTruthy();
    }

    unbind();

    expect(remove).toHaveBeenCalledWith('focusout', safeHandler);
  });
});
