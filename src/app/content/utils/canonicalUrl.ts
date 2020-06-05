import { CANONICAL_MAP, ObjectLiteral } from '../../../canonicalBookMap';
import { BOOKS } from '../../../config';
import { AppServices } from '../../types';
import { assertDefined } from '../../utils';
import { hasOSWebData } from '../guards';
import { Book } from '../types';
import { makeUnifiedBookLoader } from '../utils';
import { findArchiveTreeNode } from './archiveTreeUtils';

export async function getCanonicalUrlParams(
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader'],
  book: Book,
  pageId: string,
  bookVersion?: string
) {
  const bookDefaultMap = [[book.id, {}]] as Array<[string, ObjectLiteral<undefined>]>;
  const getBook = makeUnifiedBookLoader(archiveLoader, osWebLoader);
  const canonicals = ([
    ...(CANONICAL_MAP[book.id] || []),
    ...(BOOKS[book.id] && bookVersion === BOOKS[book.id].defaultVersion ? bookDefaultMap : []),
    // use the current book as a last resort if it has the same version as in books config
  ]).filter(([id]) => !!BOOKS[id]);

  for (const [id, CANONICAL_PAGES_MAP] of canonicals) {
    const version = BOOKS[id].defaultVersion;
    const canonicalBook = book.id === id  && hasOSWebData(book) ? book : await getBook(id, version);
    const mappedPageId = CANONICAL_PAGES_MAP[pageId] || pageId;
    const treeSection = findArchiveTreeNode(canonicalBook.tree, mappedPageId);

    if (treeSection) {
      const pageInBook = assertDefined(treeSection.slug, 'Expected page to have slug.');
      return {book: {slug: canonicalBook.slug}, page: {slug: pageInBook}};
    }
  }

  return null;
}
