import { CANONICAL_MAP } from '../../../canonicalBookMap';
import { BOOKS } from '../../../config';
import { AppServices } from '../../types';
import { assertDefined } from '../../utils';
import { makeUnifiedBookLoader } from '../utils';
import { findArchiveTreeNode } from './archiveTreeUtils';

export async function getCanonicalUrlParams(
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader'],
  bookId: string,
  pageShortId: string,
  bookVersion?: string
) {
  const getBook = makeUnifiedBookLoader(archiveLoader, osWebLoader);

  const canonicals = [
    ...(CANONICAL_MAP[bookId] || []),
    ...(BOOKS[bookId] && bookVersion === BOOKS[bookId].defaultVersion ? [bookId] : []),
    // use the current book as a last resort if it has the same version as in books config
  ].filter((id) => !!BOOKS[id]);

  for (const id of canonicals) {
    const version = BOOKS[id].defaultVersion;
    const canonicalBook = await getBook(id, version);
    const treeSection = findArchiveTreeNode(canonicalBook.tree, pageShortId);

    if (treeSection) {
      const pageInBook = assertDefined(treeSection.slug, 'Expected page to have slug.');
      return {book: canonicalBook.slug, page: pageInBook};
    }
  }

  return null;
}
