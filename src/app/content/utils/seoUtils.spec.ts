import createTestServices from '../../../test/createTestServices';
import makeArchiveSection from '../../../test/mocks/archiveSection';
import makeArchiveTree from '../../../test/mocks/archiveTree';
import { Book, Page } from '../types';
import { formatBookData } from '../utils';
import { createTitle, getPageDescription } from './seoUtils';
import {
  contentPage,
  contentPageShort,
  contentPageWithObjectives,
  emptyPage,
  eobPage,
  eocPage,
  mockBook,
  mockOsWebBook,
} from './seoUtils.spec.data';

// tslint:disable: max-line-length
describe('getDescription', () => {
  const services = createTestServices();
  const archiveLoader = services.archiveLoader;
  const book = formatBookData(mockBook, mockOsWebBook);

  archiveLoader.mockBook(book);

  it('makes a description for content page', async() => {
    archiveLoader.mockPage(book, contentPage, 'page-slug');
    const description = await getPageDescription(services, book, contentPage);
    expect(description).toMatchInlineSnapshot(
      `"For example, take a look at the image above. This image is of the Andromeda Galaxy, which contains billions of individual stars, huge clouds of gas, and..."`
    );
  });

  it('makes a description for content page with insufficient text', async() => {
    archiveLoader.mockPage(book, contentPageShort, 'page-slug');
    const description = await getPageDescription(services, book, contentPageShort);
    expect(description).toMatchInlineSnapshot(
      `"This free textbook is an OpenStax resource written to increase student access to high-quality, peer-reviewed learning materials."`
    );
  });

  it('makes a description for content page with learning objectives', async() => {
    archiveLoader.mockPage(book, contentPageWithObjectives, 'page-slug');
    const description = await getPageDescription(services, book, contentPageWithObjectives);
    expect(description).toMatchInlineSnapshot(
      `"This is the paragraph that comes after the learning objectives section. It does not have any special classes applied...."`
    );
  });

  it('makes a description for end-of-chapter page', async() => {
    archiveLoader.mockPage(book, eocPage, 'page-slug');
    const description = await getPageDescription(services, book, eocPage);
    expect(description).toMatchInlineSnapshot(
      `"Religion describes the beliefs, values, and practices related to sacred or spiritual concerns. Social theorist Émile Durkheim defined religion as a “uni..."`
    );
  });

  it('makes a description for end-of-book page', async() => {
    archiveLoader.mockPage(book, eobPage, 'page-slug');
    const description = await getPageDescription(services, book, eobPage);
    expect(description).toMatchInlineSnapshot(
      `"This free textbook is an OpenStax resource written to increase student access to high-quality, peer-reviewed learning materials."`
    );
  });

  it('makes a description for a page with no content', async() => {
    archiveLoader.mockPage(book, emptyPage, 'page-slug');
    const description = await getPageDescription(services, book, emptyPage);
    expect(description).toMatchInlineSnapshot(
      `"This free textbook is an OpenStax resource written to increase student access to high-quality, peer-reviewed learning materials."`
    );
  });
});

describe('createTitle', () => {
  const intl = createTestServices().intl.getIntlObject();

  it('creates title for a page without a parent and without .os-text class in the title', async() => {
    const page = makeArchiveSection('page1');
    const book = {
      title: 'book',
      tree: makeArchiveTree('book', [page]),
    };
    const title = await createTitle(page as any as Page, book as any as Book, intl);
    expect(title).toEqual('page1 - book | OpenStax');
  });

  it('creates title for answer key page', async() => {
    const page = makeArchiveSection('<span class="os-text">chapter 1</span>');
    const answerKey = makeArchiveTree(
      '<span class="os-text">Answer Key</span>',
      [makeArchiveTree('some nested chapter', [page])]
    );
    const book = {
      title: 'book',
      tree: makeArchiveTree('book', [answerKey]),
    };
    const title = await createTitle(page as any as Page, book as any as Book, intl);
    expect(title).toEqual('Answer Key chapter 1 - book | OpenStax');
  });

  it('creates title for a page inside a chapter', async() => {
    const page = makeArchiveSection('<span class="os-text">page1</span>');
    const chapter = makeArchiveTree(
      '<span class="os-number">1</span><span class="os-text">Chapter</span>',
      [makeArchiveSection('some other page'), makeArchiveTree('some nested chapter', [page])]
    );
    const book = {
      title: 'book',
      tree: makeArchiveTree('book', [chapter]),
    };
    const title = await createTitle(page as any as Page, book as any as Book, intl);
    expect(title).toEqual('Ch. 1 page1 - book | OpenStax');
  });

  it('creates title for a page which has a number and is inside a chapter', async() => {
    const page = makeArchiveSection('<span class="os-number">3</span><span class="os-text">page1</span>');
    const chapter = makeArchiveTree(
      '<span class="os-number">1</span><span class="os-text">Chapter</span>',
      [makeArchiveTree('some nested chapter', [page])]
    );
    const book = {
      title: 'book',
      tree: makeArchiveTree('book', [chapter]),
    };
    const title = await createTitle(page as any as Page, book as any as Book, intl);
    expect(title).toEqual('3 page1 - book | OpenStax');
  });
});
