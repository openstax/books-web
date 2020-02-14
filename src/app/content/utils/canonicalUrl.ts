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

  const canonicals = [...(CANONICAL_MAP[bookId] || []), bookId] // use the current book as a last resort
    .filter((id) => !!BOOKS[id])
    .map((id) => ({
      id,
      version: bookVersion && id === bookId
        ? bookVersion
        : BOOKS[id].defaultVersion,
    }));

  for (const {id, version} of canonicals) {

    const canonicalBook = await getBook(id, version);
    const treeSection = findArchiveTreeNode(canonicalBook.tree, pageShortId);
    if (treeSection) {
      const pageInBook = assertDefined(treeSection.slug, 'Expected page to have slug.');
      const params = {book: canonicalBook.slug, page: pageInBook};

      return version === BOOKS[id].defaultVersion || id !== bookId
        ? params
        : {...params, version};
    }
  }

  return null;
}
