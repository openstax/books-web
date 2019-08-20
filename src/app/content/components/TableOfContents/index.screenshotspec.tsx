/** @jest-environment puppeteer */
import { finishRender, navigate, setDesktopViewport, setMobileViewport } from '../../../../test/browserutils';

const TEST_PAGE_NAME = 'test-page-1';
const TEST_PAGE_LONG_NUMBER = '1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units';
const TEST_PAGE_URL = `/books/book-slug-1/pages/${TEST_PAGE_NAME}`;
const TEST_PAGE_LONG_NUMBER_URL = `/books/book-slug-1/pages/${TEST_PAGE_LONG_NUMBER}`;
const openToc = '[aria-label="Click to open the Table of Contents"]';

describe('Sidebar', () => {
  it('renders correctly on mobile', async() => {
    setMobileViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await finishRender(page);
    await page.waitForSelector(openToc);
    await page.click(openToc);
    await finishRender(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });

  });

  it('renders correctly on desktop', async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await finishRender(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('renders correctly expanded chapter on mobile with long numbers', async() => {
    setMobileViewport(page);
    await navigate(page, TEST_PAGE_LONG_NUMBER_URL);
    await finishRender(page);
    await page.waitForSelector(openToc);
    await page.click(openToc);
    await finishRender(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('renders correctly expanded chapter on desktop with long numbers', async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_PAGE_LONG_NUMBER_URL);
    await finishRender(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

});
