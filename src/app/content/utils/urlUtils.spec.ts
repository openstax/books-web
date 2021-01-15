import cloneDeep from 'lodash/cloneDeep';
import { book as mockArchiveBook, page } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { resetModules } from '../../../test/utils';
import { Book } from '../types';
import { formatBookData } from '../utils';
import {
  fromRelativeUrl,
  getBookPageUrlAndParams,
  getPageIdFromUrlParam,
  toRelativeUrl
} from './urlUtils';

const testUUID = 'longidin-vali-dfor-mat1-111111111111';

jest.mock('../../../config', () => {
  const mockBook = (jest as any).requireActual('../../../test/mocks/archiveLoader').book;
  return {BOOKS: {
   [mockBook.id]: {defaultVersion: mockBook.version},
  }};
});

describe('getBookPageUrlAndParams', () => {
  it('generates params without version', () => {
    const result = getBookPageUrlAndParams(formatBookData(mockArchiveBook, mockCmsBook), page);
    expect((result.params.book as any).version).toBeUndefined();
  });

  it('generates params with version', () => {
    const result = getBookPageUrlAndParams(
      {...formatBookData(mockArchiveBook, mockCmsBook), version: 'asdf'},
      page
    );
    expect((result.params.book as any).version).toBe('asdf');
  });
  it('generates params for books without osweb data', () => {
    const result = getBookPageUrlAndParams(formatBookData({...mockArchiveBook, id: testUUID}, undefined), page);

    expect((result.params.book as any)).not.toHaveProperty('slug');
    expect((result.params.book as any)).toMatchObject({uuid: testUUID, version: mockArchiveBook.version});
  });
});

describe('getUrlParamForPageId', () => {
  let book: Book;
  let getUrlParamForPageId: any;

  beforeEach(() => {
    resetModules();
    getUrlParamForPageId = require('./urlUtils').getUrlParamForPageId;

    book = cloneDeep({
      tree: {
        contents: [
          {
            id: 'pagelongid@1',
            slug: 'preface',
            title: '<span class="os-text">Preface</span>',
          },
        ],
        id: 'booklongid@1',
        title: 'book',
      },
    }) as Book;
  });

  it('finds title in book tree using the long id', () => {
    expect(getUrlParamForPageId(book, 'pagelongid')).toEqual({slug: 'preface'});
    expect(getUrlParamForPageId(book, 'pagelongid@1')).toEqual({slug: 'preface'});
  });

  it('returns uuid param if tree is missing a slug', () => {
    delete (book.tree.contents[0] as any).slug;

    expect(getUrlParamForPageId(book, 'pagelongid@1')).toEqual({uuid: 'pagelongid'});
  });

  it('throws on invalid id', () => {
    expect(() =>
      getUrlParamForPageId(book, 'wokowokowko')
    ).toThrowErrorMatchingInlineSnapshot(
      `"BUG: could not find page \\"wokowokowko\\" in undefined"`
    );
  });

  describe('in production', () => {
    beforeEach(() => {
      resetModules();
      jest.doMock('../../../config', () => ({
        APP_ENV: 'production',
      }));

      getUrlParamForPageId = require('./urlUtils').getUrlParamForPageId;
    });

    it('throws if tree is missing a slug and env is production', () => {
      delete (book.tree.contents[0] as any).slug;
      expect(() =>
        getUrlParamForPageId(book, 'pagelongid@1')
      ).toThrowErrorMatchingInlineSnapshot(
        `"could not find page slug for \\"pagelongid@1\\" in undefined"`
      );
    });
  });
});

describe('getPageIdFromUrlParam', () => {
  let book: Book;

  beforeEach(() => {
    book = cloneDeep({
      tree: {
        contents: [
          {
            id: 'pagelongid@1',
            slug: 'preface',
            title: '<span class="os-text">Preface</span>',
          },
        ],
        id: 'booklongid@1',
        slug: 'book-slug',
        title: 'book',
      },
    }) as Book;
  });

  it('finds id for simple param', () => {
    expect(getPageIdFromUrlParam(book, {slug: 'Preface'})).toEqual('pagelongid');
  });

  it('ignores captialization', () => {
    expect(getPageIdFromUrlParam(book, {slug: 'preface'})).toEqual('pagelongid');
  });

  it('doesn\'t search if page param is an uuid param', () => {
    book.tree.contents[0].id = 'doesntmatter';
    expect(getPageIdFromUrlParam(book, {uuid: 'pagelongid'})).toEqual('pagelongid');
  });

  it('returns undefined for unknown route', () => {
    expect(getPageIdFromUrlParam(book, {slug: 'asdfasdf'})).toBeUndefined();
  });
});

describe('toRelativeUrl', () => {
  const BOOK_SLUG = 'book1';
  const PAGE_SLUG = 'page1';
  const BOOK_URL = `/books/${BOOK_SLUG}`;
  const PAGE_URL = `${BOOK_URL}/pages/${PAGE_SLUG}`;

  it('when the same page', () => {
    const url = toRelativeUrl(PAGE_URL, PAGE_URL);
    expect(url).toMatchInlineSnapshot(`"page1"`);
  });

  it('when in the same book', () => {
    const url = toRelativeUrl(`${BOOK_URL}/pages/doesnotmatter`, PAGE_URL);
    expect(url).toMatchInlineSnapshot(`"page1"`);
  });

  it('when it includes a hash', () => {
    const url = toRelativeUrl(`${BOOK_URL}/pages/doesnotmatter`, PAGE_URL + '#test');
    expect(url).toMatchInlineSnapshot(`"page1#test"`);
  });

  it('when in the same book but it ends with a /', () => {
    const url = toRelativeUrl(`${BOOK_URL}/pages/doesnotmatter/`, PAGE_URL);
    expect(url).toMatchInlineSnapshot('"../page1"');
  });

  it('when under the same Page (unused)', () => {
    const url = toRelativeUrl(`${PAGE_URL}/doesnotmatter`, PAGE_URL);
    expect(url).toMatchInlineSnapshot(`"../page1"`);
  });

  it('when deeply under the same Page (unused)', () => {
    const url = toRelativeUrl(
      `${PAGE_URL}/doesnotmatter/doesnotmatter`,
      PAGE_URL
    );
    expect(url).toMatchInlineSnapshot(`"../../page1"`);
  });

  it('when in a different book', () => {
    const url = toRelativeUrl(
      '/books/doesnotmatter/pages/doesnotmatter',
      PAGE_URL
    );
    expect(url).toMatchInlineSnapshot(`"../../book1/pages/page1"`);
  });

  it('when at the root', () => {
    const url = toRelativeUrl('/', PAGE_URL);
    expect(url).toMatchInlineSnapshot(`"books/book1/pages/page1"`);
  });

  it('when at the top', () => {
    const url = toRelativeUrl('/doesnotmatter', PAGE_URL);
    expect(url).toMatchInlineSnapshot(`"books/book1/pages/page1"`);
  });

  it('when not in a book and not at the root', () => {
    const url = toRelativeUrl('/doesnotmatter/doesnotmatter', PAGE_URL);
    expect(url).toMatchInlineSnapshot(`"../books/book1/pages/page1"`);
  });
});

describe('fromRelativeUrl', () => {

  it('relative url includes parent levels', () => {
    const url = fromRelativeUrl('/books/somebook/pages/somepage', '../../someotherbook/pages/otherpage');
    expect(url).toBe('/books/someotherbook/pages/otherpage');
  });

  it('relative url includes parent levels and a hash', () => {
    const url = fromRelativeUrl('/books/somebook/pages/somepage', '../../someotherbook/pages/otherpage#hi');
    expect(url).toBe('/books/someotherbook/pages/otherpage#hi');
  });

  it('relative url includes page and a hash', () => {
    const url = fromRelativeUrl('/books/somebook/pages/somepage', 'somesecondpage#hello');
    expect(url).toBe('/books/somebook/pages/somesecondpage#hello');
  });

  it('relative url is just a hash', () => {
    const url = fromRelativeUrl('/books/somebook/pages/somepage', '#hello');
    expect(url).toBe('/books/somebook/pages/somepage#hello');
  });

  it('relative url is empty string', () => {
    const url = fromRelativeUrl('/books/somebook/pages/somepage', '');
    expect(url).toBe('/books/somebook/pages/somepage');
  });

  it('when the same page', () => {
    const url = fromRelativeUrl('/books/somebook/pages/somepage', './somesecondpage');
    expect(url).toBe('/books/somebook/pages/somesecondpage');
  });

  it('returns url if it is absolute', () => {
    const url = fromRelativeUrl('https://openstax.org/books/somebook/pages/somepage', './somesecondpage');
    expect(url).toBe('https://openstax.org/books/somebook/pages/somesecondpage');
  });
});
