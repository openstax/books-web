/** @jest-environment puppeteer */
import pretty from 'pretty';
import { finishRender, navigate } from '../../test/browserutils';

const TEST_PAGE_WITHOUT_MATH = '/books/book-slug-1/pages/2-test-page-3';
const TEST_PAGE_WITH_LINKS_NAME = '1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units';
const TEST_PAGE_WITH_LINKS = '/books/book-slug-1/pages/' + TEST_PAGE_WITH_LINKS_NAME;

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

      // these elements are intended to be changed on page load
      [
        '[data-testid="user-nav"]',
        '[data-testid="nav-login"]',
      ].forEach((selector) => {
        const element = root.querySelector(selector);
        if (element) {
          element.remove();
        }
      });

      // these attributes are intended to be changed on page load
      [
        ['[data-testid="toc"]', 'style'],
      ].forEach(([selector, attribute]) => {
        const element = root.querySelector(selector);
        if (element) {
          element.removeAttribute(attribute);
        }
      });

      // react-dom and react-dom/server handle empty value attributes
      // inconsistently
      root.querySelectorAll('[value=""]').forEach((element) => {
        element.removeAttribute('value');
      });

      return root.innerHTML;
    };

    await page.setJavaScriptEnabled(false);
    await navigate(page, TEST_PAGE_WITHOUT_MATH);

    const firstHTML = await page.evaluate(getHtml);

    await page.setJavaScriptEnabled(true);
    await navigate(page, TEST_PAGE_WITHOUT_MATH);
    await finishRender(page);

    const secondHTML = await page.evaluate(getHtml);

    expect(typeof(firstHTML)).toEqual('string');
    expect(pretty(secondHTML)).toEqual(pretty(firstHTML));
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
      'test-page-1',
    ]);
  });
});
