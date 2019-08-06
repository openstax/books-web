/** @jest-environment puppeteer */
import fetch from 'node-fetch';
import { url } from './test/browserutils';

describe('Prerender sanity tests', () => {

  it('has a release manifest', async() => {
    const release = await fetch(url('rex/release.json'))
      .then((response) => response.text());

    expect(release).toMatchSnapshot();
  });
});
