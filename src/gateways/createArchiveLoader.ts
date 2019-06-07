import memoize from 'lodash/fp/memoize';
import { ArchiveBook, ArchiveContent, ArchivePage } from '../app/content/types';
import { stripIdVersion } from '../app/content/utils';
import { acceptStatus } from '../helpers/fetch';

interface Extras {
  books: Array<{
    ident_hash: string
  }>;
}

export default (url: string) => {
  const archiveFetch = <T>(fetchUrl: string) => fetch(fetchUrl)
    .then(acceptStatus(200, (status, message) => `Error response from archive "${url}" ${status}: ${message}`))
    .then((response) => response.json() as Promise<T>);

  const cache = new Map();
  const contentsLoader = memoize((id: string) => archiveFetch<ArchiveContent>(`${url}/contents/${id}`)
    .then((response) => {
      cache.set(id, response);
      return response;
    })
  );

  const getBookIdsForPage: (pageId: string) => Promise<string[]> =
    memoize((pageId) => archiveFetch<Extras>(`${url}/extras/${pageId}`).
      then(({books}) => books.map(({ident_hash}) => stripIdVersion(ident_hash)))
    );

  return {
    book: (bookId: string, bookVersion: string | undefined) => {
      const bookRef = bookVersion ? `${stripIdVersion(bookId)}@${bookVersion}` : stripIdVersion(bookId);

      return {
        cached: () => cache.get(bookRef) as ArchiveBook | undefined,
        load: () => contentsLoader(bookRef) as Promise<ArchiveBook>,

        page: (pageId: string) => ({
          cached: () => cache.get(`${bookRef}:${pageId}`) as ArchivePage | undefined,
          load: () => contentsLoader(`${bookRef}:${pageId}`) as Promise<ArchivePage>,
        }),
      };
    },
    getBookIdsForPage,
  };
};
