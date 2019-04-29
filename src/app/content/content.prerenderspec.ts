/** @jest-environment puppeteer */
import { navigate } from '../../test/browserutils';

const TEST_PAGE = '/books/book-slug-1/pages/test-page-1';
const TEST_PAGE_WITHOUT_MATH = '/books/book-slug-1/pages/test-page-3';
const TEST_PAGE_WITH_LINKS = '/books/book-slug-1/pages/1-test-page-2';

describe('content', () => {
  it('doesn\'t modify the markup on page load', async() => {
    const getHtml = () => {
      if (!document) {
        return null;
      }
      const root = document.getElementById('root');
      if (!root) {
        return null;
      }
      return root.innerHTML;
    };

    await page.setJavaScriptEnabled(false);
    await navigate(page, TEST_PAGE_WITHOUT_MATH);

    const firstHTML = await page.evaluate(getHtml);

    await page.setJavaScriptEnabled(true);
    await navigate(page, TEST_PAGE_WITHOUT_MATH);

    const secondHTML = await page.evaluate(getHtml);

    expect(typeof(firstHTML)).toEqual('string');
    expect(secondHTML).toEqual(firstHTML);
  });

  it('adds content fonts to the head', async() => {
    await page.setJavaScriptEnabled(false);
    await navigate(page, TEST_PAGE);

    const links: string[] = await page.evaluate(() =>
      document
        ? Array.from(document.querySelectorAll('head link')).map((element) => element.getAttribute('href'))
        : []
    );

    expect(links).toContainEqual(
      'https://fonts.googleapis.com/css?family=Noto+Sans:400,400i,700,700i|Roboto+Condensed:300,300i,400,400i,700,700i'
    );
  });

  it('updates links in content', async() => {
    await page.setJavaScriptEnabled(false);
    await navigate(page, TEST_PAGE_WITH_LINKS);

    const links: string[] = await page.evaluate(() =>
      document
        ? Array.from(document.querySelectorAll('#main-content a'))
          .map((element) => element.getAttribute('href'))
        : []
    );

    expect(links).toEqual([
      '/books/book-slug-1/pages/test-page-1',
    ]);
  });
});
