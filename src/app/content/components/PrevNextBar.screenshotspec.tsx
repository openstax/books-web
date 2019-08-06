/** @jest-environment puppeteer */
import { finishRender, navigate, setDesktopViewport, setMobileViewport } from '../../../test/browserutils';

const TEST_PAGE_NAME = 'test-page-1';
const TEST_NEXT_PAGE_LINK = '1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units';
const TEST_LAST_PAGE = 'd-glossary-of-key-symbols-and-notation';
const NEXT_PAGE_ARIA_LABEL = 'Next Page';
const TEST_PAGE_URL = `/books/book-slug-1/pages/${TEST_PAGE_NAME}`;
const TEST_LAST_PAGE_URL = `/books/book-slug-1/pages/${TEST_LAST_PAGE}`;

describe('PrevNextBar', () => {
  it('renders correctly next element in mobile', async() => {
    setMobileViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await finishRender(page);
    await scrollDown();
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });

  });

  it('renders correctly next element on desktop', async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await finishRender(page);
    await scrollDown();
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('renders correctly prev and next elements on mobile', async() => {
    setMobileViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await finishRender(page);
    await scrollDown();
    await page.click(`[href="${TEST_NEXT_PAGE_LINK}"][aria-label="${NEXT_PAGE_ARIA_LABEL}"]`);
    await finishRender(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('renders correctly prev and next elements on desktop', async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await finishRender(page);
    await scrollDown();
    await page.click(`[href="${TEST_NEXT_PAGE_LINK}"][aria-label="${NEXT_PAGE_ARIA_LABEL}"]`);
    await finishRender(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('renders correctly prev element on mobile', async() => {
    setMobileViewport(page);
    await navigate(page, TEST_LAST_PAGE_URL);
    await finishRender(page);
    await scrollDown();
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('renders correctly prev element on desktop', async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_LAST_PAGE_URL);
    await finishRender(page);
    await scrollDown();
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

});

const scrollDown = () => page.evaluate(() => {
  return window && document && document.documentElement && window.scrollBy(0, document.documentElement.scrollHeight);
});
