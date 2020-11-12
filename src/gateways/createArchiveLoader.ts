import { ArchiveBook, ArchiveContent, ArchivePage } from '../app/content/types';
import { stripIdVersion } from '../app/content/utils';
import { getIdVersion } from '../app/content/utils/idUtils';
import createCache, { Cache } from '../helpers/createCache';
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

  const contentsLoader = <C extends ArchiveContent>(cache: Cache<string, C>) => (id: string) => {
    const cached = cache.get(id);
    if (cached) {
      return Promise.resolve(cached);
    }

    return archiveFetch<C>(`${url}/contents/${id}.json`)
      .then((response) => {
        cache.set(id, response);
        return response;
      });
  };

  const bookCache = createCache<string, ArchiveBook>({maxRecords: 20});
  const bookLoader = contentsLoader<ArchiveBook>(bookCache);

  const pageCache = createCache<string, ArchivePage>({maxRecords: 20});
  const pageLoader = contentsLoader<ArchivePage>(pageCache);

  interface BookReference {id: string; bookVersion: string | undefined; }
  const extrasCache = createCache<string, BookReference[]>({maxRecords: 20});
  const getBookIdsForPage: (pageId: string) => Promise<BookReference[]> = (pageId) => {
    const cached = extrasCache.get(pageId);
    if (cached) {
      return Promise.resolve(cached);
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
        cached: () => bookCache.get(bookRef),
        load: () => bookLoader(bookRef),

        page: (pageId: string) => ({
          cached: () => pageCache.get(`${bookRef}:${pageId}`),
          load: () => pageLoader(`${bookRef}:${pageId}`),
        }),
      };
    },
    getBookIdsForPage,
  };
};
