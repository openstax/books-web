/** @jest-environment puppeteer */
import {
  fullPageScreenshot,
  navigate,
  setDesktopViewport,
  setMobileViewport
} from '../../test/browserutils';

const TEST_PAGE_URL = '/books/book-slug-1/pages/test-page-for-generic-styles';

describe('content', () => {
  it('looks right', async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await page.emulateMedia('print');
    const screen = await fullPageScreenshot(page);
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('looks right on mobile', async() => {
    setMobileViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await page.emulateMedia('print');
    const screen = await fullPageScreenshot(page);
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });
});
