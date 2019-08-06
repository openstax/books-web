import fs from 'fs';
import cloneDeep from 'lodash/cloneDeep';
import path from 'path';
import { ArchiveBook, ArchivePage } from '../../app/content/types';

export const book = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../fixtures/contents/testbook1-shortid'), 'utf8')
) as ArchiveBook;

export const page = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../fixtures/contents/testbook1-shortid:testpage1-shortid'), 'utf8')
) as ArchivePage;

export const shortPage = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../fixtures/contents/testbook1-shortid:testpage4-shortid'), 'utf8')
) as ArchivePage;

export const lastPage = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../fixtures/contents/testbook1-shortid:testpage12-shortid'), 'utf8')
) as ArchivePage;

const books: {[key: string]: ArchiveBook} = {
  [`${book.id}@${book.version}`]: book,
};

const bookPages: {[key: string]: {[key: string]: ArchivePage}} = {
  [`${book.id}@${book.version}`]: {
    [page.id]: page,
    [shortPage.id]: shortPage,
  },
};

export default () => {
  const localBooks = cloneDeep(books);
  const localBookPages = cloneDeep(bookPages);

  const resolveBook = (bookId: string, bookVersion: string) => localBooks[`${bookId}@${bookVersion}`];

  const loadBook = jest.fn((bookId, bookVersion) => {
    const bookData = resolveBook(bookId, bookVersion);
    return bookData ? Promise.resolve(bookData) : Promise.reject();
  });
  const loadPage = jest.fn((bookId, bookVersion, pageId) => {
    const pages = localBookPages[`${bookId}@${bookVersion}`];
    const pageData = pages && pages[pageId];
    return pageData ? Promise.resolve(pageData) : Promise.reject();
  });
  const cachedBook = jest.fn((bookId, bookVersion): ArchiveBook | undefined => {
    return resolveBook(bookId, bookVersion);
  });
  const cachedPage = jest.fn((bookId, bookVersion, pageId): ArchivePage | undefined => {
    const pages = localBookPages[`${bookId}@${bookVersion}`];
    return pages && pages[pageId];
  });

  const getBookIdsForPage = jest.fn((_pageId: string) => Promise.resolve([] as string[]));

  return {
    book: (bookId: string, bookVersion: string | undefined) => ({
      cached: () => cachedBook(bookId, bookVersion),
      load: () => loadBook(bookId, bookVersion),

      page: (pageId: string) => ({
        cached: () => cachedPage(bookId, bookVersion, pageId),
        load: () => loadPage(bookId, bookVersion, pageId),
      }),
    }),
    getBookIdsForPage,
    mock: { loadBook, loadPage, cachedBook, cachedPage, getBookIdsForPage },
    mockBook: (newBook: ArchiveBook) => {
      localBooks[`${newBook.id}@${newBook.version}`] = newBook;
      localBookPages[`${newBook.id}@${newBook.version}`] = {};
    },
    mockPage: (parentBook: ArchiveBook, newPage: ArchivePage) => {
      localBookPages[`${parentBook.id}@${parentBook.version}`][newPage.id] = newPage;
      localBooks[`${parentBook.id}@${parentBook.version}`].tree.contents.push({
        id: `${newPage.id}@${newPage.version}`,
        shortId: `${newPage.shortId}@${newPage.version}`,
        title: newPage.title,
      });
    },
  };
};
