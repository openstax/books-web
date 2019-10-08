/** @jest-environment puppeteer */
import {
  finishRender,
  navigate,
  setDesktopViewport
} from '../../../../../test/browserutils';

const TEST_PAGE_NAME = 'test-page-1';
const TEST_PAGE_URL = `/books/book-slug-1/pages/${TEST_PAGE_NAME}`;

const selectSearchInputDesktop = '[data-testid="desktop-search-input"]';
const clearSearchInputSelector = '[data-testid="desktop-clear-search"]';
const closeSearchSidebarDesktopSelector = '[data-testid="close-search"]';
const searchSidebarSelector = '[aria-label="Search results sidebar"]';
const workingSearchText = 'moon\n';

const openAndTriggerSearchDesktop = async(text: string) => {
  await page.waitForSelector(selectSearchInputDesktop);
  await page.type(selectSearchInputDesktop, text);
  await finishRender(page);
};

const clearSearchInputDesktop = async() => {
  await page.waitForSelector(clearSearchInputSelector);
  await page.click(clearSearchInputSelector);
  await finishRender(page);
};

const closeSearchSidebarDesktop = async() => {
  await page.waitForSelector(closeSearchSidebarDesktopSelector);
  await page.click(closeSearchSidebarDesktopSelector);
  await finishRender(page);
};

it('clears search input without affecting search results sidebar', async() => {
  setDesktopViewport(page);
  await navigate(page, TEST_PAGE_URL);
  await finishRender(page);

  await openAndTriggerSearchDesktop(workingSearchText);
  await clearSearchInputDesktop();

  expect(await page.waitForSelector(searchSidebarSelector, {visible: true})).toBeTruthy();

  const searchInput = await page.$(selectSearchInputDesktop);
  if (searchInput) {
    let inputValue = await searchInput.getProperty('value');
    inputValue = await inputValue.jsonValue();
    expect(await inputValue).toBe('');
  }

});

it('closes the search results sidebar without affecting search input', async() => {
  setDesktopViewport(page);
  await navigate(page, TEST_PAGE_URL);
  await finishRender(page);

  await openAndTriggerSearchDesktop(workingSearchText);
  await closeSearchSidebarDesktop();

  expect(await page.waitForSelector(searchSidebarSelector, {hidden: true})).toBeTruthy();

  const searchInput = await page.$(selectSearchInputDesktop);
  if (searchInput) {
    let inputValue = await searchInput.getProperty('value');
    inputValue = await inputValue.jsonValue();
    expect(await inputValue).toBe('moon');
  }

});
