/** @jest-environment puppeteer */
import { finishRender, navigate, setDesktopViewport, setMobileViewport } from '../../../test/browserutils';

const TEST_PAGE_NAME = 'test-page-1';
const TEST_PAGE_URL = `/books/book-slug-1/pages/${TEST_PAGE_NAME}`;

describe('BookBanner', () => {
  it('renders correctly when title fits one line on mobile', async() => {
    setMobileViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await page.evaluate(() => {
      const h1 = document && document.querySelector('h1');
      if (h1) {
        h1.innerHTML = '<span class=\'os - text\'>chapter text here</span>';
      }
    });
    await finishRender(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });

  });

  it('renders correctly when title fits two lines without truncation on mobile', async() => {
    setMobileViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await page.evaluate(() => {
      const h1 = document && document.querySelector('h1');
      if (h1) {
        h1.innerHTML = '<span class=\'os-text\'>The First Law of Thermodynamics and Some Simple Processes</span>';
      }
    });
    await finishRender(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });

  });

  it('renders correctly when title truncates after two lines on mobile', async() => {
    setMobileViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await page.evaluate(() => {
      const h1 = document && document.querySelector('h1');
      // tslint:disable-next-line:max-line-length
      const text = '15.7 Statistical Interpretation of Entropy and the Second Law of Thermodynamics: The Underlying Explanation test text';
      if (h1) {
        h1.innerHTML = '<span class=\'os-text\'>' + text + '</span>';
      }
    });
    await finishRender(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });

  });

  it('renders correctly when title fits without truncation on desktop', async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await page.evaluate(() => {
      const h1 = document && document.querySelector('h1');
      const text = 'Energy and the Simple Harmonic Oscillator';
      if (h1) {
        h1.innerHTML = '<span class=\'os-text\'>' + text + '</span>';
      }
    });
    await finishRender(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });

  });

  it('renders correctly when title truncates after one line on desktop', async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await page.evaluate(() => {
      const h1 = document && document.querySelector('h1');
      // tslint:disable-next-line:max-line-length
      const text = 'Statistical Interpretation of Entropy and the Second Law of Thermodynamics: The Underlying Explanation';
      if (h1) {
        h1.innerHTML = '<span class=\'os-text\'>' + text + '</span>';
      }
    });
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
