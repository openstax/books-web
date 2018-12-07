const mockFetch = (code: number, data: any) => jest.fn(() => Promise.resolve({
  json: () => Promise.resolve(data),
  status: code,
  text: () => Promise.resolve(data),
}));

describe('archiveLoader', () => {
  const fetchBackup = fetch;

  afterEach(() => {
    jest.resetModules();
    (global as any).fetch = fetchBackup;
  });

  it('requests data from archive url for book', () => {
    (global as any).fetch = mockFetch(200, {some: 'data'});
    const archiveLoader = require('./createArchiveLoader').default('url/');

    archiveLoader.book('coolid', undefined).load();

    expect(fetch).toHaveBeenCalledWith('url/coolid');
  });

  it('requests data from archive url for page', () => {
    (global as any).fetch = mockFetch(200, {some: 'data'});
    const archiveLoader = require('./createArchiveLoader').default('url/');

    archiveLoader.book('coolid', undefined).page('coolpageid').load();

    expect(fetch).toHaveBeenCalledWith('url/coolid:coolpageid');
  });

  it('returns cached book data', async() => {
    (global as any).fetch = mockFetch(200, {some: 'data'});
    const archiveLoader = require('./createArchiveLoader').default('url/');

    const one = await archiveLoader.book('coolid', undefined).load();
    const two = archiveLoader.book('coolid', undefined).cached();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(two).toBe(one);
  });

  it('returns cached page data', async() => {
    (global as any).fetch = mockFetch(200, {some: 'data'});
    const archiveLoader = require('./createArchiveLoader').default('url/');

    const one = await archiveLoader.book('coolid', undefined).page('coolpageid').load();
    const two = archiveLoader.book('coolid', undefined).page('coolpageid').cached();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(two).toBe(one);
  });

  it('returns versioned book data', async() => {
    (global as any).fetch = mockFetch(200, {some: 'data'});
    const archiveLoader = require('./createArchiveLoader').default('url/');

    await archiveLoader.book('coolid', 'version').load();

    expect(fetch).toHaveBeenCalledWith('url/coolid@version');
  });

  it('returns versioned page data', async() => {
    (global as any).fetch = mockFetch(200, {some: 'data'});
    const archiveLoader = require('./createArchiveLoader').default('url/');

    await archiveLoader.book('coolid', 'version').page('pageid').load();

    expect(fetch).toHaveBeenCalledWith('url/coolid@version:pageid');
  });

  it('memoizes requests', () => {
    (global as any).fetch = mockFetch(200, {some: 'data'});
    const archiveLoader = require('./createArchiveLoader').default('url/');

    archiveLoader.book('coolid', undefined).load();
    archiveLoader.book('coolid2', undefined).load();
    archiveLoader.book('coolid', undefined).load();
    archiveLoader.book('coolid1', undefined).load();
    archiveLoader.book('coolid', undefined).load();
    archiveLoader.book('coolid2', undefined).load();

    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('returns error', async() => {
    (global as any).fetch = mockFetch(404, 'not found');
    const archiveLoader = require('./createArchiveLoader').default('url/');

    let error: Error | null = null;

    try {
      await archiveLoader.book('coolid', undefined).load();
    } catch (e) {
      error = e;
    }

    if (error) {
      expect(error.message).toEqual('Error response from archive 404: not found');
    } else {
      expect(error).toBeTruthy();
    }
  });
});

export default undefined;
