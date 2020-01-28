import { Document } from '@openstax/types/lib.dom';
import { assertWindow } from '../app/utils';
import createTestStore from '../test/createTestStore';
import analytics, { registerGlobalAnalytics } from './analytics';

const makeEvent = (doc: Document) => {
  const event = doc.createEvent('MouseEvents');
  event.initEvent('click', true, false);
  return event;
};

describe('registerGlobalAnalytics', () => {
  const window = assertWindow();
  const document = window.document; const store = createTestStore();
  let clickLink: jest.SpyInstance;
  let clickButton: jest.SpyInstance;
  let print: jest.SpyInstance;
  let unload: jest.SpyInstance;
  let pageFocus: jest.SpyInstance;
  const addListener = jest.fn();
  const matchMedia = (window as any).matchMedia = jest.fn();

  matchMedia.mockReturnValue({addListener});

  registerGlobalAnalytics(window, store);

  beforeEach(() => {
    clickLink = jest.spyOn(analytics.clickLink, 'track');
    clickButton = jest.spyOn(analytics.clickButton, 'track');
    print = jest.spyOn(analytics.print, 'track');
    unload = jest.spyOn(analytics.unload, 'track');
    pageFocus = jest.spyOn(analytics.pageFocus, 'track');

    clickLink.mockClear();
    clickButton.mockClear();
    print.mockClear();
  });

  it('reports anchor clicks', () => {
    const anchor = document.createElement('a');
    document.body.append(anchor);
    anchor.dispatchEvent(makeEvent(document));

    expect(clickLink).toHaveBeenCalled();
    expect(clickButton).not.toHaveBeenCalled();
  });

  it('reports button clicks', () => {
    const button = document.createElement('button');
    document.body.append(button);
    button.dispatchEvent(makeEvent(document));

    expect(clickLink).not.toHaveBeenCalled();
    expect(clickButton).toHaveBeenCalled();
  });

  it('reports unload', () => {
    const event = document.createEvent('Event');
    event.initEvent('beforeunload', true, false);

    document.dispatchEvent(event);

    expect(unload).toHaveBeenCalled();
  });

  it('reports focusin', () => {
    if (!window.onfocus) {
      return expect(window.onfocus).toBeTruthy();
    }
    window.onfocus({} as any);
    expect(pageFocus).toHaveBeenCalledWith(expect.anything(), true);
  });

  it('reports focusout', () => {
    if (!window.onblur) {
      return expect(window.onblur).toBeTruthy();
    }
    window.onblur({} as any);
    expect(pageFocus).toHaveBeenCalledWith(expect.anything(), false);
  });

  it('noops on unknown click target', () => {
    const event = makeEvent(document);

    Object.defineProperty(event, 'target', {
      value: undefined,
    });

    document.dispatchEvent(event);

    expect(clickLink).not.toHaveBeenCalled();
    expect(clickButton).not.toHaveBeenCalled();
  });

  it('tracks print', () => {
    expect(addListener).toHaveBeenCalledTimes(1);
    addListener.mock.calls[0][0]({matches: true});
    expect(print).toHaveBeenCalled();
  });

  it('doesn\'t track print on other media changes', () => {
    expect(addListener).toHaveBeenCalledTimes(1);
    addListener.mock.calls[0][0]({matches: false});
    expect(print).not.toHaveBeenCalled();
  });
});
