import { CANONICAL_MAP } from '../../../canonicalBookMap';
import { BOOKS } from '../../../config';
import { AppServices } from '../../types';
import { assertDefined } from '../../utils';
import { formatBookData } from '../utils';
import { getUrlParamForPageId } from './urlUtils';

export async function getBook(
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader'],
  bookId: string,
  defaultVersion: string) {

  const bookLoader = archiveLoader.book(bookId, defaultVersion);
  const osWebBook = await osWebLoader.getBookFromId(bookId);
  const archiveBook = await bookLoader.load();
  return formatBookData(archiveBook, osWebBook);
}

export async function getCanonicalUrl(
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader'],
  bookId: string,
  pageShortId: string
  ) {
  const canonicals: string[] = CANONICAL_MAP[bookId] || [];
  for (const id of canonicals) {
    const version = assertDefined(BOOKS[id], `Could not find ${id} in BOOKS config`).defaultVersion;

    const canonicalBook = await getBook(archiveLoader, osWebLoader, id, version);
    const pageInBook = getUrlParamForPageId(canonicalBook, pageShortId, true);

    if (pageInBook) {
      return {bookSlug: canonicalBook.slug, pageSlug: pageInBook};
    }
  }

  return null;
}
