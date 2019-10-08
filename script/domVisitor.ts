import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import { basename } from 'path';
import ProgressBar from 'progress';
import puppeteer from 'puppeteer';
import { Book } from '../src/app/content/types';
import { flattenArchiveTree, getBookPageUrlAndParams, makeUnifiedBookLoader } from '../src/app/content/utils';
import config from '../src/config';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import createOSWebLoader from '../src/gateways/createOSWebLoader';

const port = process.env.PORT || '8000';
const rootUrl = `http://localhost:${port}`;
const devTools = false;
const auditName = process.argv[3]; // because it's being called via entry.js
const onlyOneBook = process.argv[4];
const auditPath = `./audits/${auditName}`;

if (!auditName) {
  throw new Error(`audit name is required`);
}
if (!fs.existsSync(path.resolve(__dirname, `${auditPath}.ts`))) {
  throw new Error(`audit ${auditName} doesn't exist`);
}

export type Audit = () => string[];

async function visitPages(page: puppeteer.Page, bookPages: string[], audit: Audit) {
  const bar = new ProgressBar('visiting [:bar] :current/:total (:etas ETA) ', {
    complete: '=',
    incomplete: ' ',
    total: bookPages.length,
  });

  for (const pageUrl of bookPages) {

    await page.goto(`${rootUrl}${pageUrl}`);
    await page.waitForSelector('body[data-rex-loaded="true"]');

    const matches = await page.evaluate(audit);
    if (matches.length > 0) {
      bar.interrupt(`- (${matches.length}) ${basename(pageUrl)}#${matches[0]}`);
    }
    bar.tick();
  }
}

async function run() {
  const audit = (await import(auditPath)).default;
  const browser = await puppeteer.launch({
    devtools: devTools,
  });
  const books = await findBooks();

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60 * 1000);

  for (const book of books) {
    await visitPages(page, findBookPages(book), audit);
  }

  await browser.close();

  if (books.length === 0) {
    // tslint:disable-next-line:no-console
    console.error(`Could not find a matching book. ${onlyOneBook ? 'Check that the slug name is correct' : ''}`);
    process.exit(1);
  }
}

run().then(null, (err) => {
  console.error(err); // tslint:disable-line:no-console
  process.exit(1);
});

async function findBooks() {
  // Get the book config whether the server is prerendered or dev mode
  const resp = await fetch(`${rootUrl}/rex/release.json`);
  let bookConfig: typeof config.BOOKS;
  // dev server also returns a 200 but says 'not found'
  try {
    bookConfig = (await resp.json()).books;
  } catch {
    bookConfig = config.BOOKS;
  }
  (global as any).fetch = fetch;
  const archiveLoader = createArchiveLoader(`${rootUrl}${config.REACT_APP_ARCHIVE_URL}`);
  const osWebLoader = createOSWebLoader(`${rootUrl}${config.REACT_APP_OS_WEB_API_URL}`);

  const bookLoader = makeUnifiedBookLoader(archiveLoader, osWebLoader);
  const books = await Promise.all(Object.entries(bookConfig).map(([bookId, {defaultVersion}]) =>
    bookLoader(bookId, defaultVersion)
  ));
  return books.filter((book) => onlyOneBook ? book.slug === onlyOneBook : true);
}

function findBookPages(book: Book) {
  const pages = flattenArchiveTree(book.tree);
  return pages.map((treeSection) => getBookPageUrlAndParams(book, treeSection).url);
}
