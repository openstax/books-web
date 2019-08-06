import memoize from 'lodash/fp/memoize';
import { Book } from '../app/content/types';
import { acceptStatus } from '../helpers/fetch';

export interface OSWebBook {
  meta: {
    slug: string;
  };
  publish_date: string;
  authors: Array<{
    value: {
      name: string;
    }
  }>;
  cover_color: Book['theme'];
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

  const url = `${prefix}/v2/pages`;
  const toJson = (response: any) => response.json() as Promise<OSWebResponse>;

  const firstRecord = (id: string) => (data: OSWebResponse) => {
    if (!data.items[0]) {
      throw new Error(`OSWeb record "${id}" not found`);
    }
    return data.items[0];
  };

  const loader = (fetcher: (param: string) => Promise<any>) => memoize(
    (param) => fetcher(param)
      .then(acceptStatus(200, (status, message) => `Error response from OSWeb ${status}: ${message}`))
      .then(toJson)
      .then(firstRecord(param))
  );

  const slugLoader = loader((slug: string) => fetch(`${url}?type=books.Book&fields=${fields}&slug=${slug}`));
  const idLoader = loader((id: string) => fetch(`${url}?type=books.Book&fields=${fields}&cnx_id=${id}`));

  return {
    getBookFromId: (id: string) => idLoader(id),
    getBookFromSlug: (slug: string) => slugLoader(slug),
    getBookIdFromSlug: (slug: string) => slugLoader(slug).then(({cnx_id}) => cnx_id),
    getBookSlugFromId: (id: string) => idLoader(id).then(({meta: {slug}}) => slug),
  };
};
