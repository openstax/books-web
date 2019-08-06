import fetch from 'node-fetch';
import portfinder from 'portfinder';
import Loadable from 'react-loadable';
import {
  BOOKS,
  CODE_VERSION,
  REACT_APP_ACCOUNTS_URL,
  REACT_APP_ARCHIVE_URL,
  REACT_APP_OS_WEB_API_URL,
  RELEASE_ID
} from '../../src/config';
import createArchiveLoader from '../../src/gateways/createArchiveLoader';
import createOSWebLoader from '../../src/gateways/createOSWebLoader';
import createSearchClient from '../../src/gateways/createSearchClient';
import createUserLoader from '../../src/gateways/createUserLoader';
import { startServer } from '../server';
import {
  getBookSitemap,
  getStats,
  prepareBookPages,
  prepareBooks,
  prepareErrorPages,
  renderPages
} from './contentPages';
import { writeAssetFile } from './fileUtils';
import { renderSitemap, renderSitemapIndex } from './sitemap';

(global as any).fetch = fetch;

async function renderManifest() {
  writeAssetFile('/rex/release.json', JSON.stringify({
    books: BOOKS,
    code: CODE_VERSION,
    id: RELEASE_ID,
  }, null, 2));
}

async function render() {
  await Loadable.preloadAll();
  const port = await portfinder.getPortPromise();
  const archiveLoader = createArchiveLoader(`http://localhost:${port}${REACT_APP_ARCHIVE_URL}`);
  const osWebLoader = createOSWebLoader(`http://localhost:${port}${REACT_APP_OS_WEB_API_URL}`);
  const userLoader = createUserLoader(`http://localhost:${port}${REACT_APP_ACCOUNTS_URL}`);
  const searchClient = createSearchClient(`http://localhost:${port}`);
  const {server} = await startServer({port, onlyProxy: true});
  const renderHelpers = {archiveLoader, osWebLoader, userLoader, searchClient};

  await renderPages(renderHelpers, await prepareErrorPages());

  const books = await prepareBooks(archiveLoader, osWebLoader);
  for (const {loader, book} of books) {
    const bookPages = await prepareBookPages(loader, book);

    renderSitemap(book.slug, await getBookSitemap(loader, bookPages));
    await renderPages({archiveLoader, osWebLoader, userLoader, searchClient}, bookPages);
  }

  await renderSitemapIndex();
  await renderManifest();

  const {numPages, elapsedMinutes} = getStats();
  // tslint:disable-next-line:no-console max-line-length
  console.log(`Prerender complete. Rendered ${numPages} pages, ${numPages / elapsedMinutes}ppm`);

  server.close();
}

render().catch((e) => {
  console.error(e.message, e.stack); // tslint:disable-line:no-console
  process.exit(1);
});
