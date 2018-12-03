import fs from 'fs';
import flatten from 'lodash/fp/flatten';
import fetch from 'node-fetch';
import path from 'path';
import portfinder from 'portfinder';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';
import createApp from '../src/app';
import { content } from '../src/app/content/routes';
import { ArchiveTree, ArchiveTreeSection } from '../src/app/content/types';
import { stripIdVersion } from '../src/app/content/utils';
import { notFound } from '../src/app/errors/routes';
import * as errorSelectors from '../src/app/errors/selectors';
import * as navigationSelectors from '../src/app/navigation/selectors';
import { AnyHistoryAction, HistoryAction } from '../src/app/navigation/types';
import { historyActionUrl } from '../src/app/navigation/utils';
import { AppState } from '../src/app/types';
import createArchiveLoader from '../src/helpers/createArchiveLoader';
import FontCollector from '../src/helpers/FontCollector';
import startServer from './server';

(global as any).fetch = fetch;

const ASSET_DIR = path.resolve(__dirname, '../build');
const BOOKS = JSON.parse(process.env.BOOKS || 'null') as {
  [key: string]: {
    defaultVersion: string;
  };
};
const indexHtml = fs.readFileSync(path.resolve(ASSET_DIR, 'index.html'), 'utf8');

if (!BOOKS) {
  throw new Error('BOOKS must be valid json');
}

async function render() {

  const port = await portfinder.getPortPromise();
  const {server} = await startServer({port, onlyProxy: true});
  const archiveLoader = createArchiveLoader(`http://localhost:${port}/contents/`);

  async function renderManifest() {
    writeFile(path.join(ASSET_DIR, 'release.json'), JSON.stringify({
      books: BOOKS,
      code: process.env.CODE_VERSION,
      id: process.env.RELEASE_ID,
    }, null, 2));
  }

  async function renderContentPage(bookId: string, bookVersion: string, pageId: string) {
    const book = await archiveLoader.book(`${bookId}@${bookVersion}`);
    const page = await archiveLoader.page(`${bookId}@${bookVersion}`, pageId);

    const action: HistoryAction<typeof content> = {
      method: 'push',
      params: {
        bookId: book.shortId,
        pageId: page.shortId,
      },
      route: content,
      state: {
        bookUid: book.id,
        bookVersion,
        pageUid: page.id,
      },
    };

    await renderPage(action);
  }

  async function renderPage(action: AnyHistoryAction, expectedCode: number = 200) {
    const url = historyActionUrl(action);
    console.info(`running ${url}`); // tslint:disable-line:no-console
    const app = createApp({
      initialEntries: [action],
      services: {
        archiveLoader,
      },
    });

    await app.services.promiseCollector.calm();

    const state = app.store.getState();
    const styles = new ServerStyleSheet();
    const pathname = navigationSelectors.pathname(state);
    const code = errorSelectors.code(state);

    if (pathname !== url) {
      throw new Error(`UNSUPPORTED: url: ${url} caused a redirect.`);
    }
    if (code !== expectedCode) {
      throw new Error(`UNSUPPORTED: url: ${url} has an unexpected response code.`);
    }

    const body = renderToString(
       <StyleSheetManager sheet={styles.instance}>
         <app.container />
       </StyleSheetManager>
    );

    const html = injectHTML(indexHtml, {
      body,
      fonts: app.services.fontCollector.fonts,
      state,
      styles,
    });

    writeFile(path.join(ASSET_DIR, url), html);
  }

  await renderManifest();

  const notFoundPage: HistoryAction<typeof notFound> = {
    method: 'push',
    route: notFound,
  };

  await renderPage(notFoundPage, 404);

  for (const [bookId, {defaultVersion}] of Object.entries(BOOKS)) {
    const book = await archiveLoader.book(`${bookId}@${defaultVersion}`);

    for (const section of getPages(book.tree.contents)) {
      await renderContentPage(bookId, defaultVersion, stripIdVersion(section.id));
    }
  }

  server.close();
}

render().catch((e) => {
  console.error(e.message); // tslint:disable-line:no-console
  process.exit(1);
});

interface Options {
  body: string;
  styles: ServerStyleSheet;
  fonts: FontCollector['fonts'];
  state: AppState;
}
function injectHTML(html: string, {body, styles, state, fonts}: Options) {
  html = html.replace('</head>',
    fonts.map((font) => `<link rel="stylesheet" href="${font}">`).join('') +
    styles.getStyleTags() +
    '</head>'
  );
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${body}</div>` +
    `<script>window.__PRELOADED_STATE__ = ${JSON.stringify(state).replace(/</g, '\\u003c')}</script>`
  );

  return html;
}

function makeDirectories(filepath: string) {
  const dirname = path.dirname(filepath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  makeDirectories(dirname);
  fs.mkdirSync(dirname);
}

function writeFile(filepath: string, contents: string) {
  makeDirectories(filepath);
  fs.writeFile(filepath, contents, () => null);
}

function getPages(contents: ArchiveTree[]): ArchiveTreeSection[] {
  return flatten(contents.map((section) => flatten(section.contents ? getPages(section.contents) : [section])));
}
