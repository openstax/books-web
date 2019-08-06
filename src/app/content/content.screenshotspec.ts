/** @jest-environment puppeteer */
import {
  finishRender,
  fullPageScreenshot,
  navigate,
  setDesktopViewport,
  setMobileViewport,
  setWideDesktopViewport
} from '../../test/browserutils';
import { updateAvailable } from '../notifications/actions';

const TEST_PAGE_NAME = 'test-page-1';
const TEST_PAGE_URL = `/books/book-slug-1/pages/${TEST_PAGE_NAME}`;
const TEST_SIMPLE_PAGE_URL = `/books/book-slug-1/pages/3-test-page-4`;

describe('content', () => {
  it('looks right', async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_PAGE_URL);
    const screen = await fullPageScreenshot(page);
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('short pages looks right', async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_SIMPLE_PAGE_URL);
    const screen = await fullPageScreenshot(page);
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('attribution looks right', async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_SIMPLE_PAGE_URL);
    await page.click('details[data-testid="attribution-details"]');
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
    await finishRender(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  describe('notifications', () => {
    const action = updateAvailable();

    const setup = async() => {
      await navigate(page, TEST_PAGE_URL);
      await finishRender(page);
      await page.evaluate((notificationAction) => window && window.__APP_STORE.dispatch(notificationAction), action);
      await finishRender(page);
    };

    it('looks right on inline desktop', async() => {
      await setDesktopViewport(page);
      await setup();

      const screen = await page.screenshot();
      expect(screen).toMatchImageSnapshot({
        CI: {
          failureThreshold: 1.5,
          failureThresholdType: 'percent',
        },
      });
    });
    it('looks right on toast desktop', async() => {
      await setWideDesktopViewport(page);
      await setup();

      const screen = await page.screenshot();
      expect(screen).toMatchImageSnapshot({
        CI: {
          failureThreshold: 1.5,
          failureThresholdType: 'percent',
        },
      });
    });
    it('looks right on mobile', async() => {
      await setMobileViewport(page);
      await setup();

      const screen = await page.screenshot();
      expect(screen).toMatchImageSnapshot({
        CI: {
          failureThreshold: 1.5,
          failureThresholdType: 'percent',
        },
      });
    });
  });
});
