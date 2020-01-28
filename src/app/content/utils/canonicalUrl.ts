import { CANONICAL_MAP } from '../../../canonicalBookMap';
import { BOOKS } from '../../../config';
import { AppServices } from '../../types';
import { assertDefined } from '../../utils';
import { hasOSWebData } from '../guards';
import { makeUnifiedBookLoader } from '../utils';
import { findArchiveTreeNode } from './archiveTreeUtils';

export async function getCanonicalUrlParams(
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader'],
  bookId: string,
  pageShortId: string
) {
  const getBook = makeUnifiedBookLoader(archiveLoader, osWebLoader);
  const canonicals = [
    ...(CANONICAL_MAP[bookId] || []),
    bookId, // use the current book as a last resort
  ].filter((id) => !!BOOKS[id]);

  for (const id of canonicals) {
    const version = BOOKS[id].defaultVersion;

    const canonicalBook = await getBook(id, version);
    const treeSection = findArchiveTreeNode(canonicalBook.tree, pageShortId);

    if (!hasOSWebData(canonicalBook)) {
      throw new Error (`Canonical book ${id} is missing cms data`);
    }

    if (treeSection) {
      const pageInBook = assertDefined(treeSection.slug, 'Expected page to have slug.');
      return {book: canonicalBook.slug, page: pageInBook};
    }
  }

  return null;
}
