import { AppServices } from '../app/types';
import { fields } from './createOSWebLoader';

const mockFetch = (code: number, data: any) => jest.fn(() => Promise.resolve({
  json: () => Promise.resolve(data),
  status: code,
  text: () => Promise.resolve(data),
}));

describe('osWebLoader', () => {
  const fetchBackup = fetch;
  let osWebLoader: AppServices['osWebLoader'];

  beforeEach(() => {
    osWebLoader = require('./createOSWebLoader').default('url');
  });

  afterEach(() => {
    jest.resetModules();
    (global as any).fetch = fetchBackup;
  });

  describe('getBookIdFromSlug', () => {

    describe('success', () => {
      beforeEach(() => {
        (global as any).fetch = mockFetch(200, {
          items: [{cnx_id: 'qwer', meta: {slug: 'asdf'}}],
          meta: {item_count: 1},
        });
      });

      it('gets book id', async() => {
        const id = await osWebLoader.getBookIdFromSlug('asdf');
        expect(fetch).toHaveBeenCalledWith(`url/v2/pages?type=books.Book&fields=${fields}&slug=asdf`);
        expect(id).toEqual('qwer');
      });
    });

    it('throws if there are no matching records', async() => {
      (global as any).fetch = mockFetch(200, {items: [], meta: {item_count: 0}});
      let message: string | undefined;

      try {
        await osWebLoader.getBookIdFromSlug('asdf');
      } catch (e) {
        message = e.message;
      }

      expect(message).toEqual('OSWeb record "asdf" not found');
    });

    it('throws on error', async() => {
      (global as any).fetch = mockFetch(404, 'not found');
      let message: string | undefined;

      try {
        await osWebLoader.getBookIdFromSlug('asdf');
      } catch (e) {
        message = e.message;
      }

      expect(message).toEqual('Error response from OSWeb 404: not found');
    });
  });

  describe('getBookSlugFromId', () => {
    beforeEach(() => {
      (global as any).fetch = mockFetch(200, {
        items: [{cnx_id: 'qwer', meta: {slug: 'asdf'}}],
        meta: {item_count: 1},
      });
    });

    it('gets book slug', async() => {
      const slug = await osWebLoader.getBookSlugFromId('qwer');
      expect(fetch).toHaveBeenCalledWith(`url/v2/pages?type=books.Book&fields=${fields}&cnx_id=qwer`);
      expect(slug).toEqual('asdf');
    });
  });

  describe('getBookFromSlug', () => {
    const book = {cnx_id: 'qwer', meta: {slug: 'asdf'}};
    beforeEach(() => {
      (global as any).fetch = mockFetch(200, {
        items: [book],
        meta: {item_count: 1},
      });
    });

    it('gets book', async() => {
      const result = await osWebLoader.getBookFromSlug('asdf');
      expect(fetch).toHaveBeenCalledWith(`url/v2/pages?type=books.Book&fields=${fields}&slug=asdf`);
      expect(result).toEqual(book);
    });
  });

  describe('getBookFromId', () => {
    const book = {cnx_id: 'qwer', meta: {slug: 'asdf'}};
    beforeEach(() => {
      (global as any).fetch = mockFetch(200, {
        items: [book],
        meta: {item_count: 1},
      });
    });

    it('gets book', async() => {
      const result = await osWebLoader.getBookFromId('qwer');
      expect(fetch).toHaveBeenCalledWith(`url/v2/pages?type=books.Book&fields=${fields}&cnx_id=qwer`);
      expect(result).toEqual(book);
    });
  });
});

export default undefined;
