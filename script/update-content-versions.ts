import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import { ARCHIVE_URL, REACT_APP_ARCHIVE_URL } from '../src/config';
import books from '../src/config.books';
import createArchiveLoader from '../src/gateways/createArchiveLoader';

(global as any).fetch = fetch;

const booksPath = path.resolve(__dirname, '../src/config.books.js');
let fileContents = fs.readFileSync(booksPath, 'utf8');

const archiveLoader = createArchiveLoader(`${ARCHIVE_URL}${REACT_APP_ARCHIVE_URL}`);

async function processBooks() {
  for (const [bookId, {defaultVersion}] of Object.entries(books)) {
    const {title, version} = await archiveLoader.book(bookId).load();

    fileContents = fileContents.replace(
      `${bookId}': {defaultVersion: '${defaultVersion}`,
      `${bookId}': {defaultVersion: '${version}`
    );
    console.log(`updated ${title}`); // tslint:disable-line:no-console
  }
}

function writeFile() {
  fs.writeFileSync(booksPath, fileContents, 'utf8');
}

processBooks().then(writeFile);
