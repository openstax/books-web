/** @jest-environment puppeteer */
import { checkLighthouse, navigate } from './test/browserutils';

describe('Browser sanity tests', () => {

  let consoleMessages: Array<{type: 'debug' | 'error' | 'info' | 'log' | 'warning', message: string}> = [];

  beforeEach(async() => {
    consoleMessages = [];

    page.on('console', (consoleMessage) => {
      const type = consoleMessage.type();
      const text = consoleMessage.text();

      switch (type) {
        case 'debug':
        case 'error':
        case 'info':
        case 'log':
        case 'warning':
          consoleMessages.push({type, message: text});
          break;
        default:
          throw new Error(`BUG: Unsupported console type: '${type}'`);
      }
    });

    await navigate(page, '/errors/404');
  });

  it('displays the "Hello developer" console text', async() => {
    const infoMessages = consoleMessages
      .filter(({type}) => type === 'info')
      .map(({message}) => message);

    const str = [
      '%cHowdy! If you want to help out, the source code can be found at ',
      'https://github.com/openstax/rex-web',
      ' font-weight:bold',
    ];
    expect(infoMessages).toContain(str.join(''));
  });

  it('loads the 404 page', async() => {
    const heading = await (page.evaluate(() => {
      if (document) {
        const el = document.querySelector('#root > h1');
        if (el) {
          return el.textContent;
        }
      }
    })) as string | null;
    expect(heading).toBe('page not found');
  });

  it('a11y lighthouse check', async() => {
    await checkLighthouse(browser, '/errors/404');
  });
});
