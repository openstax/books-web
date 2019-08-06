import { locationChange } from '../../navigation/actions';
import { ActionHookBody, AppServices, MiddlewareAPI } from '../../types';
import { assertDefined } from '../../utils';

describe('setHead hook', () => {
  let hookBody: ActionHookBody<typeof locationChange>;
  const helpers = {} as MiddlewareAPI & AppServices;
  const action = locationChange({location: new URL('http://localhost/'), action: 'PUSH'});

  beforeEach(() => {
    hookBody = require('./locationChange').hookBody;
  });

  it('removes meta', () => {
    if (typeof(document) === 'undefined') {
      return expect(document).toBeTruthy();
    }
    const head = assertDefined(document.head, 'document must have a head');

    for (let i = 0; i < 5; i++) {
      const tag = document.createElement('meta');
      tag.setAttribute('data-rex-page', '');
      head.appendChild(tag);
    }

    expect(head.querySelectorAll('meta[data-rex-page]').length).toEqual(5);
    hookBody(helpers)(action);
    expect(head.querySelectorAll('meta[data-rex-page]').length).toEqual(0);
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
