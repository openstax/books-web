import pathToRegexp from 'path-to-regexp';
import { notFound } from './routes';

describe('notFound', () => {
  it('matches any route', () => {
    const path = notFound.paths[0];
    const re = pathToRegexp(path, [], {end: true});
    expect(re.exec('/woooo')).not.toEqual(null);
    expect(re.exec('/foo/bar')).not.toEqual(null);
    expect(re.exec('/books/book/pages/page')).not.toEqual(null);
  });

  it('produces a relative url', () => {
    expect(notFound.getUrl({url: 'url'})).toEqual('/error/404');
  });

  it('produces a query string', () => {
    if (!notFound.getSearch) {
      return expect(notFound.getSearch).toBeTruthy();
    }
    expect(notFound.getSearch({url: 'url'})).toEqual('path=url');
  });
});
