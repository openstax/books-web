import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import { argv } from 'yargs';
import { ARCHIVE_URL, REACT_APP_ARCHIVE_URL } from '../src/config';
import createArchiveLoader from '../src/gateways/createArchiveLoader';

// archiveLoader does some dom manipulation on the tree response
// that depends on this
(global as any).DOMParser = new JSDOM().window.DOMParser;

const {
  field,
} = argv as {
  field?: string;
};

(global as any).fetch = fetch;

const archiveLoader = createArchiveLoader(`${ARCHIVE_URL}${REACT_APP_ARCHIVE_URL}`);

const bookId = argv._[1];
archiveLoader.book(bookId).load().then((book: any) => {
  if (field) {
    // tslint:disable-next-line:no-console
    console.log(book[field]);
  } else {
    // tslint:disable-next-line:no-console
    console.log(JSON.stringify(book, null, 2));
  }
});
