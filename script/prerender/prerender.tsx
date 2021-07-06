import fetch from 'node-fetch';
import portfinder from 'portfinder';
import Loadable from 'react-loadable';
import { ArchiveBook, ArchivePage } from '../../src/app/content/types';
import createIntl from '../../src/app/messages/createIntl';
import config from '../../src/config';
import BOOKS from '../../src/config.books';
import createArchiveLoader from '../../src/gateways/createArchiveLoader';
import createBookConfigLoader from '../../src/gateways/createBookConfigLoader';
import createBuyPrintConfigLoader from '../../src/gateways/createBuyPrintConfigLoader';
import { BuyPrintResponse } from '../../src/gateways/createBuyPrintConfigLoader';
import createHighlightClient from '../../src/gateways/createHighlightClient';
import createOSWebLoader from '../../src/gateways/createOSWebLoader';
import { OSWebBook } from '../../src/gateways/createOSWebLoader';
import createPracticeQuestionsLoader from '../../src/gateways/createPracticeQuestionsLoader';
import createSearchClient from '../../src/gateways/createSearchClient';
import createUserLoader from '../../src/gateways/createUserLoader';
import { startServer } from '../server';
import {
  getStats,
  minuteCounter,
  prepareBookPages,
  prepareBooks,
  renderPages,
  stats
} from './contentPages';
import createRedirects from './createRedirects';
import { createDiskCache, writeAssetFile } from './fileUtils';
import { renderSitemap, renderSitemapIndex } from './sitemap';

const {
  CODE_VERSION,
  REACT_APP_ACCOUNTS_URL,
  REACT_APP_ARCHIVE_URL,
  REACT_APP_BUY_PRINT_CONFIG_URL,
  REACT_APP_HIGHLIGHTS_URL,
  REACT_APP_OS_WEB_API_URL,
  REACT_APP_SEARCH_URL,
  RELEASE_ID,
} = config;

let networkTime = 0;
(global as any).fetch = (...args: Parameters<typeof fetch>) => {
  const networkTimer = minuteCounter();
  return fetch(...args)
    .then((response) => {
      networkTime += networkTimer();
      return response;
    });
};

async function renderManifest() {
  writeAssetFile('/rex/release.json', JSON.stringify({
    books: BOOKS,
    code: CODE_VERSION,
    id: RELEASE_ID,
  }, null, 2));

  writeAssetFile('/rex/config.json', JSON.stringify(config, null, 2));
}

async function render() {
  await Loadable.preloadAll();
  const port = await portfinder.getPortPromise();
  const archiveLoader = createArchiveLoader(`http://localhost:${port}${REACT_APP_ARCHIVE_URL}`, {
    appUrl: REACT_APP_ARCHIVE_URL,
    bookCache: createDiskCache<string, ArchiveBook>('archive-books'),
    pageCache: createDiskCache<string, ArchivePage>('archive-pages'),
  });
  const osWebLoader = createOSWebLoader(`http://localhost:${port}${REACT_APP_OS_WEB_API_URL}`, {
    cache: createDiskCache<string, OSWebBook | undefined>('osweb'),
  });
  const userLoader = createUserLoader(`http://localhost:${port}${REACT_APP_ACCOUNTS_URL}`);
  const searchClient = createSearchClient(`http://localhost:${port}${REACT_APP_SEARCH_URL}`);
  const highlightClient = createHighlightClient(`http://localhost:${port}${REACT_APP_HIGHLIGHTS_URL}`);
  const buyPrintConfigLoader = createBuyPrintConfigLoader(REACT_APP_BUY_PRINT_CONFIG_URL, {
    cache: createDiskCache<string, BuyPrintResponse>('buy-print'),
  });
  const practiceQuestionsLoader = createPracticeQuestionsLoader();
  const bookConfigLoader = createBookConfigLoader();
  const intl = createIntl();

  const {server} = await startServer({port, onlyProxy: true});
  const renderHelpers = {
    archiveLoader,
    bookConfigLoader,
    buyPrintConfigLoader,
    config,
    highlightClient,
    intl,
    osWebLoader,
    practiceQuestionsLoader,
    searchClient,
    userLoader,
  };

  const books = await prepareBooks(archiveLoader, osWebLoader);

  for (const book of books) {
    const bookPages = await prepareBookPages(book);
    const sitemap = await renderPages(renderHelpers, bookPages);

    renderSitemap(book.slug, sitemap);
  }

  await renderSitemapIndex();
  await renderManifest();
  await createRedirects(archiveLoader, osWebLoader);

  const {numPages, elapsedMinutes} = getStats();

  // tslint:disable-next-line:no-console max-line-length
  console.log({...stats, elapsedMinutes, networkTime});

  // tslint:disable-next-line:no-console max-line-length
  console.log(`Prerender complete. Rendered ${numPages} pages, ${numPages / elapsedMinutes}ppm`);

  server.close();
}

render().catch((e) => {
  console.error(e.message, e.stack); // tslint:disable-line:no-console
  process.exit(1);
});
