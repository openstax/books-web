/** @jest-environment puppeteer */
import {
  fullPageScreenshot,
  navigate,
  setDesktopViewport,
} from '../../test/browserutils';

const TEST_SIMPLE_PAGE_URL = `/books/book-slug-1/pages/3-test-page-4`;
const closeToc = '[aria-label="Click to close the Table of Contents"]';
const openToc = '[aria-label="Click to open the Table of Contents"]';

describe('print media', () => {

  beforeEach(async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_SIMPLE_PAGE_URL);
  });

  afterEach(async() => {
    await page.emulateMedia(null);
  });

  it('only shows the content', async() => {
    await page.emulateMedia('print');
    const screen = await fullPageScreenshot(page);
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('only shows the content when ToC is collapsed', async() => {
    await page.click(closeToc);
    await page.emulateMedia('print');
    const screen = await fullPageScreenshot(page);
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('only shows the content when ToC is collapsed and then re-expanded', async() => {
    await page.click(closeToc);
    await page.waitForSelector(openToc);
    await page.click(openToc);
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
