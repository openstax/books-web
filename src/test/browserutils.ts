import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';
import * as lighthouseConfig from './audits';

// jest-puppeteer will expose the `page` and `browser` globals to Jest tests.
declare global {
  var page: puppeteer.Page;
  var browser: puppeteer.Browser;
  var puppeteerConfig: {server: {port: number}};
}

if (typeof(browser) === 'undefined' || typeof(page) === 'undefined') {
  throw new Error('Browser has not been started! Did you remember to specify `@jest-environment puppeteer`?');
}

const ignoreConsoleMessages = [
  '%c %c %c Pixi.js 3.0.10 - ✰ WebGL ✰  %c  %c  http://www.pixijs.com/  %c %c ♥%c♥%c♥',
  '%cDownload the React DevTools for a better development experience: https://fb.me/react-devtools font-weight:bold',
  '%cHowdy! If you want to help out, the source code can be found at https://github.com/openstax/rex-web font-weight:bold', // tslint:disable-line:max-line-length
];

page.on('console', (consoleMessage) => {
  const text = consoleMessage.text();

  if (!ignoreConsoleMessages.find((message) => message.indexOf(text) === -1)) {
    console.log(text); // tslint:disable-line:no-console
  }
});

if (process.env.CI) {
  // set default timeout to something quite large in CI
  page.setDefaultNavigationTimeout(60 * 1000);
} else {
  page.setDefaultNavigationTimeout(90 * 1000);
}

export const desktopWidth = 1250;
export const setWideDesktopViewport = (target: puppeteer.Page) =>
  target.setViewport({height: 1074, width: desktopWidth * 2});
export const setTallerDesktopViewport = (target: puppeteer.Page) =>
  target.setViewport({height: 1074, width: desktopWidth});
export const setDesktopViewport = (target: puppeteer.Page) => target.setViewport({height: 874, width: desktopWidth});
export const setMobileViewport = (target: puppeteer.Page) => target.setViewport({height: 731, width: 411});

export const url = (path: string) => `http://localhost:${puppeteerConfig.server.port}/${path.replace(/^\/+/, '')}`;

const calmHooks = (target: puppeteer.Page) => target.evaluate(() => {
  if (window && window.__APP_ASYNC_HOOKS) {
    return window.__APP_ASYNC_HOOKS.calm();
  }
});

const setMaxViewport = async(target: puppeteer.Page) => {
  const width = await target.evaluate(() => document && document.body.offsetWidth);
  const height = await target.evaluate(() => document && document.body.offsetHeight);

  await target.setViewport({width, height});
};

export const navigate = async(target: puppeteer.Page, path: string) => {
  await target.goto(url(path));
  await calmHooks(target);
};

export const finishRender = async(target: puppeteer.Page) => {
  const screenshot = (): Buffer => target.screenshot() as unknown as Buffer;

  let lastScreen: Buffer | undefined;
  let newScreen: Buffer | undefined;

  const stillChanging = async() => {
    newScreen = await screenshot();
    return !lastScreen || !lastScreen.equals(newScreen);
  };

  while (await stillChanging()) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    lastScreen = newScreen;
  }
};

export const scrollDown = (target: puppeteer.Page) => target.evaluate(() => {
  return window && window.scrollBy(0, window.innerHeight);
});
export const scrollUp = (target: puppeteer.Page) => target.evaluate(() => {
  return window && window.scrollBy(0, -1 * window.innerHeight);
});

export const fullPageScreenshot = async(target: puppeteer.Page) => {
  // TODO - this is no longer true, book banner has fixed height
  // even when loading, test removing this.
  //
  // on pages with the book banner the size of the page gets
  // a little messed up when it IS NOT prerendered
  // (content defaults to min-height = rest of the page
  // and then the banner comes in and pushes everything down)
  await finishRender(target);
  await scrollDown(target);
  await finishRender(target);
  await scrollUp(target);
  await finishRender(target);

  const {width, height} = target.viewport();

  await setMaxViewport(target);
  await finishRender(target);

  const screen = await target.screenshot();

  await target.setViewport({width, height});

  return screen;
};

export const h1Content = (target: puppeteer.Page) => target.evaluate(() => {
  const h1 = document && document.querySelector('h1');
  return h1 && h1.textContent;
});

export const checkLighthouse = async(target: puppeteer.Browser, urlPath: string) => {

  const port = (new URL(target.wsEndpoint())).port;
  const { lhr } = await lighthouse(url(urlPath), {port}, lighthouseConfig);

  expect(lhr.categories.customAccessibility.score).toBeGreaterThanOrEqual(1);
  expect(lhr.categories.accessibility.score).toBeGreaterThanOrEqual(1);
  expect(lhr.categories.seo.score).toBeGreaterThanOrEqual(0.7);
  expect(lhr.categories['best-practices'].score).toBeGreaterThanOrEqual(0.86);
};
