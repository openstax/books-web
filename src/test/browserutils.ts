import puppeteer from 'puppeteer';

// jest-puppeteer will expose the `page` and `browser` globals to Jest tests.
declare global {
  var page: puppeteer.Page;
  var browser: puppeteer.Browser;
}

if (typeof(browser) === 'undefined' || typeof(page) === 'undefined') {
  throw new Error('Browser has not been started! Did you remember to specify `@jest-environment puppeteer`?');
}

const ignoreConsoleMessages = [
  '%cDownload the React DevTools for a better development experience: https://fb.me/react-devtools font-weight:bold',
  '%cHowdy! If you want to help out, the source code can be found at https://github.com/openstax/books-web font-weight:bold', // tslint:disable-line:max-line-length
];

page.on('console', (consoleMessage) => {
  const text = consoleMessage.text();
  if (ignoreConsoleMessages.indexOf(text) === -1) {
    console.log(text); // tslint:disable-line:no-console
  }
});

const DEV_SERVER_PORT = 8000;

export const url = (path: string) => `http://localhost:${DEV_SERVER_PORT}/${path.replace(/^\/+/, '')}`;

export const navigate = async(target: puppeteer.Page, path: string) => {
  await target.goto(url(path));

  // HACK - add delay to make sure promises have been registered
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await target.evaluate(async() => {
    if (window) {
      await window.__APP_ASYNC_HOOKS.calm();
    }
  });
};

export const finishRender = async(_: puppeteer.Page) => {
  // HACK - there is no convenient way to tell if chrome is finished rendering,
  // we should investigate inconvenient possibilities.
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

// tslint:disable-next-line:no-shadowed-variable
export const getComputedStyle = (target: puppeteer.Page, selector: string) => target.evaluate((selector) => {
  if (window) {
    const element = window.document.querySelector(selector);
    if (!element) {
      throw new Error('BUG: element not found');
    }
    const compStyle = window.getComputedStyle(element);
    const styleMap: {[name: string]: string} = {};
    for (let index = 0; index < compStyle.length; index++) { // tslint:disable-line:prefer-for-of
      const styleName = compStyle[index];
      styleMap[styleName] = compStyle.getPropertyValue(styleName);
    }
    return styleMap;
  }
}, selector);
