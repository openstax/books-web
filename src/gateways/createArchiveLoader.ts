import { ArchiveBook, ArchiveContent, ArchivePage } from '../app/content/types';
import { cleanArchiveResponse, stripIdVersion } from '../app/content/utils';
import { getIdVersion } from '../app/content/utils/idUtils';
import { acceptStatus } from '../helpers/fetch';

interface Extras {
  books: Array<{
    ident_hash: string
  }>;
}

export default (url: string) => {
  const archiveFetch = <T>(fetchUrl: string) => fetch(fetchUrl)
    .then(acceptStatus(200, (status, message) => `Error response from archive "${fetchUrl}" ${status}: ${message}`))
    .then((response) => response.json() as Promise<T>);

  const cache = new Map();
  const contentsLoader = (id: string) => {
    if (cache.has(id)) {
      return Promise.resolve(cache.get(id));
    }

    return archiveFetch<ArchiveContent>(`${url}/contents/${id}`)
      .then((response) => {
        const cleanResponse = cleanArchiveResponse(response);
        cache.set(id, cleanResponse);
        return cleanResponse;
      });
  };

  const extrasCache = new Map();
  const getBookIdsForPage: (pageId: string) => Promise<Array<{id: string, bookVersion: string | undefined}>> =
    (pageId) => {
    if (extrasCache.has(pageId)) {
      return Promise.resolve(extrasCache.get(pageId));
    }

    return archiveFetch<Extras>(`${url}/extras/${pageId}`)
      .then(({books}) => books.map(({ident_hash}) => {
        return {
          bookVersion: getIdVersion(ident_hash),
          id: stripIdVersion(ident_hash),
        };
      }))
      .then((response) => {
        extrasCache.set(pageId, response);
        return response;
      });
  };

  return {
    book: (bookId: string, bookVersion?: string) => {
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
