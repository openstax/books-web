import { BookWithOSWebData } from '../app/content/types';
import { acceptStatus } from '../helpers/fetch';

export interface OSWebBook {
  meta: {
    slug: string;
  };
  publish_date: string;
  authors: Array<{
    value: {
      name: string;
      senior_author: boolean;
    }
  }>;
  cover_color: BookWithOSWebData['theme'];
  cnx_id: string;
}

interface OSWebResponse {
  meta: {
    item_count: number
  };
  items: OSWebBook[];
}

export const fields = 'cnx_id,authors,publish_date,cover_color';

export default (prefix: string) => {
  const baseUrl = `${prefix}/v2/pages`;
  const toJson = (response: any) => response.json() as Promise<OSWebResponse>;

  const firstRecord = (data: OSWebResponse) => data.items[0];

  const cache = new Map();

  const cacheRecord = (record?: OSWebBook) => {
    if (!record) {
      return;
    }

    cache.set(record.meta.slug, record);
    cache.set(record.cnx_id, record);
    return record;
  };

  const loader = (buildUrl: (param: string) => string) => (param: string): Promise<OSWebBook | undefined> => {
    if (cache.has(param)) {
      return Promise.resolve(cache.get(param));
    }

    return fetch(buildUrl(param))
      .then(acceptStatus(200, (status, message) => `Error response from OSWeb ${status}: ${message}`))
      .then(toJson)
      .then(firstRecord)
      .then(cacheRecord)
    ;
  };

  const slugLoader = loader((slug: string) => `${baseUrl}?type=books.Book&fields=${fields}&slug=${slug}`);
  const idLoader = loader((id: string) => `${baseUrl}?type=books.Book&fields=${fields}&cnx_id=${id}`);

  return {
    getBookFromId: (id: string) => idLoader(id),
    getBookFromSlug: (slug: string) => slugLoader(slug),
    getBookIdFromSlug: (slug: string) => slugLoader(slug).then((book) => book && book.cnx_id),
    getBookSlugFromId: (id: string) => idLoader(id).then((book) => book && book.meta.slug),
    preloadCache: cacheRecord, // exposed for testing books that don't exist in osweb
  };
};
