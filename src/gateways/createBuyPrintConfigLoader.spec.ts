import createBuyPrintConfigLoader from './createBuyPrintConfigLoader';

const mockFetch = (code: number, data: any) =>
  jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(data),
      status: code,
      text: () => Promise.resolve(data),
    })
  );

describe('buyPrintConfigLoader', () => {
  const fetchBackup = fetch;
  let buyPrintConfigLoader: ReturnType<typeof createBuyPrintConfigLoader>;

  beforeEach(() => {
    buyPrintConfigLoader = createBuyPrintConfigLoader('url');
  });

  afterEach(() => {
    (global as any).fetch = fetchBackup;
  });

  it('gets config', async() => {
    (global as any).fetch = mockFetch(200, {buy_urls: []});

    const config = await buyPrintConfigLoader.load({slug: 'asdf'});
    expect(fetch).toHaveBeenCalledWith('url/asdf.json');
    expect(config).toEqual({buy_urls: []});
  });

  it('throws for unexpected errors', async() => {
    (global as any).fetch = mockFetch(500, 'unexpected error');
    let message: string | undefined;

    try {
      await buyPrintConfigLoader.load({slug: 'asdf'});
    } catch (e) {
      message = e.message;
    }

    expect(message).toMatchInlineSnapshot(
      `"Error response from BuyPrint 500: unexpected error"`
    );
  });
});
