import { FrameRequestCallback } from '@openstax/types/lib.dom';
import { MatchImageSnapshotOptions } from 'jest-image-snapshot';
import 'jest-styled-components';
import toMatchImageSnapshot from './matchers/toMatchImageSnapshot';

declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchImageSnapshot(config: {[key: string]: MatchImageSnapshotOptions}): R;
    }
  }
}
expect.extend({
  toMatchImageSnapshot,
});

jest.mock('ally.js/style/focus-within');
jest.mock('details-element-polyfill', () => jest.fn());

const ignoreConsoleMessages = [
  /*
   * jsdom chokes on cnx-recipes styles and produces large nasty
   * error messages. the styles are valid, jsdom's css parser
   * is incomplete, so hide these messages
   */
  'Error: Could not parse CSS stylesheet',
  /*
   * jsdom doesn't implement scrolling
   */
  'Error: Not implemented: window.scrollTo',
];

const originalConsoleError = console.error;  // tslint:disable-line:no-console
console.error = (msg: string) => {  // tslint:disable-line:no-console
  const shouldIgnore = !!ignoreConsoleMessages.find((ignore) => msg.indexOf(ignore) === 0);

  if (shouldIgnore) {
    return;
  }

  originalConsoleError(msg);
};

if (process.env.CI) {
  // set default timeout to something quite large in CI
  jest.setTimeout(90 * 1000);
} else {
  jest.setTimeout(120 * 1000);
}

let requestAnimationFrame: jest.SpyInstance;
let matchMedia: jest.SpyInstance;
let scrollTo: jest.SpyInstance;
let scrollBy: jest.SpyInstance;
beforeEach(() => {
  if (typeof(window) === 'undefined') {
    return;
  }

  scrollTo = window.scrollTo = jest.fn();
  scrollBy = window.scrollBy = jest.fn();

  matchMedia = window.matchMedia = jest.fn().mockImplementation((query) => {
    return {
      addListener: jest.fn(),
      matches: false,
      media: query,
      onchange: null,
      removeListener: jest.fn(),
    };
  });

  requestAnimationFrame = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(
    (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    }
  );
});

afterEach(() => {
  if (typeof(window) === 'undefined') {
    return;
  }
  (window as any).scCGSHMRCache = {};
  matchMedia.mockReset();
  scrollTo.mockReset();
  scrollBy.mockReset();
  requestAnimationFrame.mockRestore();
});
