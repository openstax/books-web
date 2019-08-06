/** @jest-environment puppeteer */
import {
  finishRender,
  navigate,
  setDesktopViewport,
  setMobileViewport,
} from '../../../test/browserutils';

const TEST_SIMPLE_PAGE_URL = `/books/book-slug-1/pages/3-test-page-4`;

describe('navbar when logged in', () => {
  beforeEach(async() => {
    await page.setCookie({domain: 'localhost', name: 'session', value: 'logged in'});
  });

  afterEach(async() => {
    await page.deleteCookie({domain: 'localhost', name: 'session'});
  });

  it('looks right when logged in on desktop', async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_SIMPLE_PAGE_URL);
    await finishRender(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('looks right when logged in on mobile', async() => {
    setMobileViewport(page);
    await page.setCookie({domain: 'localhost', name: 'session', value: 'logged in'});
    await navigate(page, TEST_SIMPLE_PAGE_URL);
    await finishRender(page);
    await page.hover('[data-testid="user-nav"]');
    await finishRender(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('looks right when logged in on mobile', async() => {
    setMobileViewport(page);
    await navigate(page, TEST_SIMPLE_PAGE_URL);
    await finishRender(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('user menu looks right on mobile', async() => {
    setMobileViewport(page);
    await navigate(page, TEST_SIMPLE_PAGE_URL);
    await finishRender(page);
    await page.click('[data-testid="user-nav-toggle"]');
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
