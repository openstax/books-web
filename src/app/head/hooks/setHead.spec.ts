import { ActionHookBody, AppServices, MiddlewareAPI } from '../../types';
import { assertDefined } from '../../utils';
import { setHead } from '../actions';

describe('setHead hook', () => {
  let hookBody: ActionHookBody<typeof setHead>;
  const helpers = {} as MiddlewareAPI & AppServices;
  const action = setHead({
    meta: [{name: 'fake', content: 'meta'}],
    title: 'cool title',
  });

  beforeEach(() => {
    hookBody = require('./setHead').hookBody;
  });

  it('adds meta', () => {
    if (typeof(document) === 'undefined') {
      return expect(document).toBeTruthy();
    }
    const head = assertDefined(document.head, 'document must have a head');

    expect(head.querySelectorAll('meta[data-rex-page]').length).toEqual(0);
    hookBody(helpers)(action);
    expect(head.querySelectorAll('meta[data-rex-page]').length).toEqual(1);
  });

  it('sets the title', () => {
    if (typeof(document) === 'undefined') {
      expect(document).toBeTruthy();
    } else {
      hookBody(helpers)(action);
      expect(document.title).toEqual('cool title');
    }
  });

  describe('outside the browser', () => {
    const documentBackup = document;

    beforeEach(() => {
      delete (global as any).document;
    });

    afterEach(() => {
      (global as any).document = documentBackup;
    });

    it('doesn\'t break', () => {
      let error: Error | null = null;

      try {
        hookBody(helpers)(action);
      } catch (e) {
        error = e;
      }

      expect(error).toEqual(null);
    });
  });
});
