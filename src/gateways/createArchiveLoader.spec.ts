import { AppServices } from '../app/types';

const mockFetch = (code: number, data: any) => jest.fn(() => Promise.resolve({
  json: () => Promise.resolve(data),
  status: code,
  text: () => Promise.resolve(data),
}));

describe('archiveLoader', () => {
  const fetchBackup = fetch;
  let archiveLoader: AppServices['archiveLoader'];

  beforeEach(() => {
    archiveLoader = require('./createArchiveLoader').default('url');
  });

  afterEach(() => {
    jest.resetModules();
    (global as any).fetch = fetchBackup;
  });

  describe('book loader', () => {
    describe('when successful', () => {
      beforeEach(() => {
        (global as any).fetch = mockFetch(200, {some: 'data'});
      });

      it('requests data from archive url for book', () => {
        archiveLoader.book('coolid', undefined).load();

        expect(fetch).toHaveBeenCalledWith('url/contents/coolid');
      });

      it('requests data from archive url for page', () => {
        archiveLoader.book('coolid', undefined).page('coolpageid').load();

        expect(fetch).toHaveBeenCalledWith('url/contents/coolid:coolpageid');
      });

      it('returns cached book data', async() => {
        const one = await archiveLoader.book('coolid', undefined).load();
        const two = archiveLoader.book('coolid', undefined).cached();

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(two).toBe(one);
      });

      it('returns cached page data', async() => {
        const one = await archiveLoader.book('coolid', undefined).page('coolpageid').load();
        const two = archiveLoader.book('coolid', undefined).page('coolpageid').cached();

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(two).toBe(one);
      });

      it('returns versioned book data', async() => {
        await archiveLoader.book('coolid', 'version').load();

        expect(fetch).toHaveBeenCalledWith('url/contents/coolid@version');
      });

      it('returns versioned page data', async() => {
        await archiveLoader.book('coolid', 'version').page('pageid').load();

        expect(fetch).toHaveBeenCalledWith('url/contents/coolid@version:pageid');
      });

      it('memoizes requests', () => {
        archiveLoader.book('coolid', undefined).load();
        archiveLoader.book('coolid2', undefined).load();
        archiveLoader.book('coolid', undefined).load();
        archiveLoader.book('coolid1', undefined).load();
        archiveLoader.book('coolid', undefined).load();
        archiveLoader.book('coolid2', undefined).load();

        expect(fetch).toHaveBeenCalledTimes(3);
      });
    });

    it('returns error', async() => {
      (global as any).fetch = mockFetch(404, 'not found');
      let error: Error | null = null;

      try {
        await archiveLoader.book('coolid', undefined).load();
      } catch (e) {
        error = e;
      }

      if (error) {
        expect(error.message).toEqual('Error response from archive "url/contents/coolid" 404: not found');
      } else {
        expect(error).toBeTruthy();
      }
    });
  });

  describe('bookIds loader', () => {
    beforeEach(() => {
      (global as any).fetch = mockFetch(200, {books: [{ident_hash: 'id'}]});
    });

    it('makes request to archive', async() => {
      await archiveLoader.getBookIdsForPage('pageId');
      expect(fetch).toHaveBeenCalledWith('url/extras/pageId');
    });

    it('returns the ids', async() => {
      expect(await archiveLoader.getBookIdsForPage('pageId')).toEqual(['id']);
    });

    it('memoizes', async() => {
      await archiveLoader.getBookIdsForPage('pageId');
      await archiveLoader.getBookIdsForPage('pageId2');
      await archiveLoader.getBookIdsForPage('pageId');

      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});
