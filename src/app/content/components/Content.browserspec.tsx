/** @jest-environment puppeteer */
import { Page } from 'puppeteer';
import { finishRender, navigate, setDesktopViewport, setMobileViewport } from '../../../test/browserutils';

const TEST_PAGE_NAME = 'test-page-for-generic-styles';
const TEST_ANCHOR = 'term103';
const TEST_PAGE_URL = `/books/book-slug-1/pages/${TEST_PAGE_NAME}#${TEST_ANCHOR}`;
const TEST_CASES: { [testCase: string]: (target: Page) => Promise<void> } = {
  Desktop: setDesktopViewport, Mobile: setMobileViewport,
};
const EXPECTED_SCROLL_TOPS: { [testCase: string]: number[] } = {
  Desktop: [265, 152, 152, 265, 354, 584, 671, 1172, 1478],
  Mobile: [239, 126, 126, 239, 448, 998, 1105, 1454, 1780],
};

describe('Content', () => {
  for (const testCase of Object.keys(TEST_CASES)) {
    describe(testCase, () => {
      beforeEach(async() => {
        const setViewport = TEST_CASES[testCase];
        await setViewport(page);
      });

      it('scrolls correctly to all elements', async() => {
        const expectedScrollTops = EXPECTED_SCROLL_TOPS[testCase];

        await navigate(page, TEST_PAGE_URL);
        // Calling finishRender() without first waiting sometimes gives scrollTop == 0
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await finishRender(page);

        // Loading page with anchor
        const anchorScrollTop = await page.evaluate('document.documentElement.scrollTop');
        expect(anchorScrollTop).toEqual(expectedScrollTops[0]);

        // Clicking links
        const links = await page.$$('#table-of-links a');
        for (const [index, link] of links.entries()) {
          await link.click();
          await finishRender(page);

          const linkScrollTop = await page.evaluate('document.documentElement.scrollTop');
          expect(linkScrollTop).toEqual(expectedScrollTops[index + 1]);
        }
      });
    });
  }
});
