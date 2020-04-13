import cloneDeep from 'lodash/cloneDeep';
import { resetModules } from '../../test/utils';
import { Book } from './types';
import {
  cleanArchiveResponse,
  getContentPageReferences,
  getPageIdFromUrlParam,
  stripIdVersion,
  toRelativeUrl,
} from './utils';

describe('stripIdVersion', () => {
  it('strips ids', () => {
    expect(stripIdVersion('asdf@qwer')).toEqual('asdf');
  });

  it('doesn\'t break with no id', () => {
    expect(stripIdVersion('asdf')).toEqual('asdf');
  });
});

describe('getContentPageReferences', () => {
  it('works with no references in the content', () => {
    expect(getContentPageReferences('some cool content')).toEqual([]);
  });

  it('works with empty content', () => {
    expect(getContentPageReferences('')).toEqual([]);
  });

  it('ignores urls not in links', () => {
    expect(
      getContentPageReferences('asdfasdfasf /contents/as8s8xu9sdnjsd9 asdfadf')
    ).toEqual([]);
  });

  it('picks up basic content reference', () => {
    expect(
      getContentPageReferences('asdfasdfasf <a href="/contents/as8s8xu9sdnjsd9"></a> asdfadf')
    ).toEqual([
      {
        match: '/contents/as8s8xu9sdnjsd9',
        pageUid: 'as8s8xu9sdnjsd9',
      },
    ]);
  });

  it('picks up multiple references', () => {
    expect(
      getContentPageReferences(`
      asdfa <a href="/contents/as8s8xu9sdnjsd9"></a> sdf
      <a href="/contents/9sdnjsd9"></a>
    `)
    ).toEqual([
      {
        match: '/contents/as8s8xu9sdnjsd9',
        pageUid: 'as8s8xu9sdnjsd9',
      },
      {
        match: '/contents/9sdnjsd9',
        pageUid: '9sdnjsd9',
      },
    ]);
  });
});

describe('getUrlParamForPageId', () => {
  let book: Book;
  let getUrlParamForPageId: any;

  beforeEach(() => {
    resetModules();
    getUrlParamForPageId = require('./utils').getUrlParamForPageId;

    book = cloneDeep({
      tree: {
        contents: [
          {
            id: 'pagelongid@1',
            shortId: 'page@1',
            slug: 'preface',
            title: '<span class="os-text">Preface</span>',
          },
        ],
        id: 'booklongid@1',
        shortId: 'book@1',
        title: 'book',
      },
    }) as Book;
  });

  it('finds title in book tree using the short id', () => {
    expect(getUrlParamForPageId(book, 'page')).toEqual({slug: 'preface'});
    expect(getUrlParamForPageId(book, 'page@1')).toEqual({slug: 'preface'});
  });

  it('finds title in book tree using the long id', () => {
    expect(getUrlParamForPageId(book, 'pagelongid')).toEqual({slug: 'preface'});
    expect(getUrlParamForPageId(book, 'pagelongid@1')).toEqual({slug: 'preface'});
  });

  it('throws on invalid id', () => {
    expect(() =>
      getUrlParamForPageId(book, 'wokowokowko')
    ).toThrowErrorMatchingInlineSnapshot(
      `"BUG: could not find page \\"wokowokowko\\" in undefined"`
    );
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
            shortId: 'page@1',
            slug: 'preface',
            title: '<span class="os-text">Preface</span>',
          },
        ],
        id: 'booklongid@1',
        shortId: 'book@1',
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

describe('cleanArchiveResponse', () => {
  let book: Book;

  beforeEach(() => {
    book = cloneDeep({
      tree: {
        contents: [
          {
            id: 'pagelongid@1',
            shortId: 'page@1',
            slug: 'chapter-1',
            // tslint:disable-next-line:max-line-length
            title: '<span class="os-number">Chapter 1</span><span class="os-divider"> </span><span class="os-text">Chapter example</span>',
          },
          {
            id: 'pagelongid@2',
            shortId: 'page@2',
            slug: 'appendix-1',
            // tslint:disable-next-line:max-line-length
            title: '<span class="os-number">Appendix 1</span><span class="os-divider"> </span><span class="os-text">Appendix example</span>',
          },
          {
            id: 'pagelongid@3',
            shortId: 'page@3',
            slug: 'chapter-2',
            title: '<span class="os-text">Chapter 2 example</span>',
          },
        ],
        id: 'booklongid@1',
        shortId: 'book@1',
        slug: 'book-slug',
        title: 'book',
      },
    }) as Book;
  });

  it('cleans up `chapter` and `appendix` from slugs and titles', () => {
    const cleanContent = cleanArchiveResponse(book);
    expect(cleanContent.tree.contents[0].title).toMatch(
      '<span class="os-number">1</span><span class="os-divider"> </span><span class="os-text">Chapter example</span>'
    );
    expect(cleanContent.tree.contents[1].title).toMatch(
      '<span class="os-number">1</span><span class="os-divider"> | </span><span class="os-text">Appendix example</span>'
    );
  });
});
