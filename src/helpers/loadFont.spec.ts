import loadFont from './loadFont';

describe('loadFont', () => {

  beforeEach(() => {
    if (typeof(document) === 'undefined') {
      throw new Error('JSDom not loaded');
    }

    const createEvent = document.createEvent.bind(document);
    const originalCreateElement = document.createElement.bind(document);

    document.createElement = jest.fn((type: string) => {
      const element = originalCreateElement(type);
      const event = createEvent('Event');
      event.initEvent('load');
      setTimeout(() => element.onload && element.onload(event), 1);

      return element;
    });
  });

  it('injects <link> into head', async() => {
    await loadFont('coolfont');

    if (document && document.head) {
      expect(document.head.innerHTML).toMatchInlineSnapshot(
        `"<link rel=\\"stylesheet\\" href=\\"coolfont\\">"`
      );
    } else if (document) {
      expect(document).toBeTruthy();
      expect(document.head).toBeTruthy();
    } else {
      expect(document).toBeTruthy();
    }
  });

  it('doesn\'t inject duplicate links', async() => {
    await loadFont('coolfont');
    await loadFont('coolfont3');
    await loadFont('coolfont');
    await loadFont('coolfont2');

    if (document && document.head) {
      expect(document.head.innerHTML).toMatchInlineSnapshot(
        `"<link rel=\\"stylesheet\\" href=\\"coolfont\\">` +
        `<link rel=\\"stylesheet\\" href=\\"coolfont3\\">` +
        `<link rel=\\"stylesheet\\" href=\\"coolfont2\\">"`
      );
    } else if (document) {
      expect(document).toBeTruthy();
      expect(document.head).toBeTruthy();
    } else {
      expect(document).toBeTruthy();
    }
  });

  describe('outside the browser', () => {
    const documentBack = document;

    beforeEach(() => {
      delete (global as any).document;
    });

    afterEach(() => {
      (global as any).document = documentBack;
    });

    it('throws an exception', async() => {
      let message = '';

      try {
        await loadFont('adsf');
      } catch (e) {
        message = e.message;
      }

      expect(message).toEqual('fonts can only be loaded in the browser');
    });
  });
});
