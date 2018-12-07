/** @jest-environment puppeteer */
import { checkLighthouse, finishRender, navigate } from '../../test/browserutils';

const TEST_PAGE = '/books/testbook1-shortid/pages/testpage1-shortid';

describe('content', () => {
  beforeEach(async() => {
    await navigate(page, TEST_PAGE);
    await finishRender(page);
  });

  it('looks right', async() => {
    const screen = await page.screenshot({fullPage: true});
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('has SkipToContent link as the first tabbed-to element', async() => {
    await page.keyboard.press('Tab');

    const isSkipToContentSelected = await page.evaluate(() => {
      if (document && document.activeElement) {
        const el = document.activeElement;
        const target = document.querySelector(`${el.getAttribute('href')}`);
        return !! ('Skip to Content' === el.textContent && el.tagName.toLowerCase() === 'a' && target);
      } else {
        return false;
      }
    });
    expect(isSkipToContentSelected).toBe(true);
  });

  it('a11y lighthouse check', async() => {
    await checkLighthouse(TEST_PAGE);
  });

});
