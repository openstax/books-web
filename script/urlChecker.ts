import fs from 'fs';
import { JSDOM } from 'jsdom';
import chunk from 'lodash/chunk';
import fetch from 'node-fetch';
import path from 'path';
import { argv } from 'yargs';
import { RedirectsData } from '../data/redirects/types';
import { content as contentRoute } from '../src/app/content/routes';
import { Book, BookWithOSWebData, LinkedArchiveTreeSection } from '../src/app/content/types';
import { findTreePages } from '../src/app/content/utils/archiveTreeUtils';
import { getBookPageUrlAndParams, getUrlParamForPageId } from '../src/app/content/utils/urlUtils';
import { assertDefined } from '../src/app/utils';
import config from '../src/config';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import createOSWebLoader from '../src/gateways/createOSWebLoader';
import { findBooks } from './utils/bookUtils';
import progressBar from './utils/progressBar';

(global as any).DOMParser = new JSDOM().window.DOMParser;

const {
  rootUrl,
  bookId,
  bookVersion,
  archiveUrl,
  useUnversionedUrls,
} = argv as {
  rootUrl?: string;
  bookId?: string;
  bookVersion?: string;
  archiveUrl?: string;
  useUnversionedUrls?: boolean;
};

async function checkPages(
  book: BookWithOSWebData,
  pages: LinkedArchiveTreeSection[],
  redirectedPages: Array<{ pageId: string, redirectedURL: string }> | undefined
) {
  let anyFailures = false;
  const bar = progressBar(`checking ${book.slug} [:bar] :current/:total (:etas ETA)`, {
    complete: '=',
    incomplete: ' ',
    total: pages.length,
    width: 20,
  });

  const notFound: string[] = [];

  const visitPage = async(page: LinkedArchiveTreeSection) => {
    const pageURL = getUrl(book)(page);
    try {
      let isSuccessful: boolean = false;
      if (redirectedPages) {
        const redirectedURLs = redirectedPages.filter(({ pageId }) => pageId === page.id)
        .map(({ redirectedURL }) => redirectedURL);
        for (const redirectedURL of redirectedURLs) {
          if ((await fetch(`${rootUrl}${redirectedURL}`)).status === 200) {
            isSuccessful = true;
            break;
          }
        }
      } else {
        isSuccessful = (await fetch(`${rootUrl}${pageURL}`)).status === 200;
      }

      if (!isSuccessful) {
        notFound.push(pageURL);
      }
    } catch {
      anyFailures = true;
      bar.interrupt(`- (error loading) ${pageURL}`);
    }

    bar.tick();
  };

  for (const pageChunk of chunk(pages, 50)) {
    await Promise.all(pageChunk.map(visitPage));
  }

   // tslint:disable-next-line:no-console
  console.log(`checked ${pages.length} pages, found ${notFound.length} 404s`);

  if (notFound.length) {
    console.log(`404'd: ${notFound.length === pages.length // tslint:disable-line:no-console
      ? 'all'
      : `\n${notFound.join('\n')}\n`}`);
  }

  return anyFailures || notFound.length > 0;
}

const loadRedirectedPagesForBookId = async(bookID: string) => {
  const fileName = path.resolve(__dirname, `../data/redirects/${bookID}.json`);
  if (!fs.existsSync(fileName)) { return; }

  const bookRedirects: RedirectsData = await import(fileName);
  const redirectedPages: Array<{pageId: string, redirectedURL: string}> = [];

  for (const { pageId, pathname } of bookRedirects) {
    redirectedPages.push({
      pageId,
      redirectedURL: pathname,
    });
  }

  return redirectedPages;
};

const getUrl = (book: Book) => useUnversionedUrls
  ? (treeSection: LinkedArchiveTreeSection) =>
      contentRoute.getUrl({
        book: {
          slug: (book as BookWithOSWebData).slug,
        },
        page: getUrlParamForPageId(book, treeSection.id),
      })
  : (treeSection: LinkedArchiveTreeSection) => getBookPageUrlAndParams(book, treeSection).url;

async function checkUrls() {
  const archiveLoader = createArchiveLoader(`${archiveUrl ? archiveUrl : rootUrl}${config.REACT_APP_ARCHIVE_URL}`);
  const osWebLoader = createOSWebLoader(`${rootUrl}${config.REACT_APP_OS_WEB_API_URL}`);
  const url = assertDefined(rootUrl, 'please define a rootUrl parameter, format: http://host:port');
  const books = await findBooks({
    archiveLoader,
    bookId,
    bookVersion,
    osWebLoader,
    rootUrl: url,
  });

  let anyFailures = false;

  for (const book of books) {
    const pages = findTreePages(book.tree);
    const redirectedPages = await loadRedirectedPagesForBookId(book.id);
    anyFailures = await checkPages(book, pages, redirectedPages) || anyFailures;
  }

  if (anyFailures) {
    process.exit(1);
  }
}

checkUrls().catch((err) => {
  console.error(err); // tslint:disable-line:no-console
  process.exit(1);
});
