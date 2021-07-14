import { FrameRequestCallback } from '@openstax/types/lib.dom';
import { MatchImageSnapshotOptions } from 'jest-image-snapshot';
import toMatchImageSnapshot from './matchers/toMatchImageSnapshot';
import { resetModules } from './utils';

jest.mock('../helpers/Sentry');

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

const ignoreConsoleErrorMessages = [
  /*
   * jsdom chokes on cnx-recipes styles and produces large nasty
   * error messages. the styles are valid, jsdom's css parser
   * is incomplete, so hide these messages
   */
  /Error: Could not parse CSS stylesheet/,
  /*
   * jsdom doesn't implement scrolling
   */
  /Error: Not implemented: window.scrollTo/,
  /*
   * complains about not having compenent that throw before render
   * not being wrapped in <ErrorBoundary>
  */
  /(.*)Consider adding an error boundary to your tree to customize error handling behavior.(.*)/,
];

const originalConsoleError = console.error;  // tslint:disable-line:no-console
console.error = (msg: unknown) => {  // tslint:disable-line:no-console
  const shouldIgnore = !!ignoreConsoleErrorMessages.find(
    (ignore) => typeof msg === 'string' && msg.match(ignore)
  );

  if (shouldIgnore) {
    return;
  }

  originalConsoleError(msg);
};

const ignoreConsoleWarnMessages = [
  // react-loadable still didn't rename unsafe methods
  // We should wait for one of those prs:
  // https://github.com/jamiebuilds/react-loadable/pull/227
  // https://github.com/jamiebuilds/react-loadable/pull/220
  // to get merged and then we can update this module and remove this from an array.
  /Please update the following components: LoadableComponent\s*$/,
];

const originalConsoleWarn = console.warn;  // tslint:disable-line:no-console
console.warn = (msg: string) => {  // tslint:disable-line:no-console
  const shouldIgnore = !!ignoreConsoleWarnMessages.find((ignore) => msg.match(ignore));

  if (shouldIgnore) {
    return;
  }

  originalConsoleWarn(msg);
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
let mockGa: any;
let mockResizeObserver: any;

resetModules();

afterAll(async() => {
  await resetModules();
});

beforeEach(() => {
  if (typeof(window) === 'undefined') {
    return;
  }

  scrollTo = window.scrollTo = jest.fn();
  scrollBy = window.scrollBy = jest.fn();
  window.dataLayer = window.dataLayer || [];

  // function also defined in index.html
  function gtag() {
    window!.dataLayer.push(arguments);
  }

  matchMedia = window.matchMedia = jest.fn().mockImplementation((query) => {
    return {
      addEventListener: jest.fn(),
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: jest.fn(),
    };
  });

  requestAnimationFrame = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(
    (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    }
  );

  mockGa = jest.fn();
  window.ga = mockGa;
  window.gtag = gtag;
  // tslint:disable-next-line: only-arrow-functions
  mockResizeObserver = function(callback: () => void) {
    callback();
    return ({
      disconnect: jest.fn(),
      observe: jest.fn(),
      unobserve: jest.fn(),
    });
  };
  globalThis.ResizeObserver = mockResizeObserver;
});

afterEach(() => {
  if (typeof(window) === 'undefined') {
    return;
  }
  (window as any).scCGSHMRCache = {};
  (window as any).getSelection = () => ({
    removeAllRanges: () => null,
  });
  matchMedia.mockReset();
  scrollTo.mockReset();
  scrollBy.mockReset();
  requestAnimationFrame.mockRestore();
});
