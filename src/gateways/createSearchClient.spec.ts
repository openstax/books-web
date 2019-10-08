import { resetModules } from '../test/utils';
import createSearchClient from './createSearchClient';

describe('createSearchClient', () => {
  const fetchBackup = fetch;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    resetModules();
    fetchSpy = (global as any).fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          hits: {
            hits: [],
            total: 0,
          },
          overallTook: 0,
          shards: {},
          timedOut: false,
          took: 0,
        }),
        status: 200,
      })
    );
  });

  afterEach(() => {
    (global as any).fetch = fetchBackup;
  });

  it('calls fetch with the baseurl', async() => {
    const client = createSearchClient('asdf');

    await client.search({
      books: ['book'],
      indexStrategy: '1',
      q: 'foo',
      searchStrategy: '1',
    });

    expect(fetchSpy.mock.calls[0][0]).toMatchInlineSnapshot(
      `"asdf/search?q=foo&books=book&index_strategy=1&search_strategy=1"`
    );
  });
});
