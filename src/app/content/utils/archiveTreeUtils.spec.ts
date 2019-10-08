import { book, page } from '../../../test/mocks/archiveLoader';
import { treeWithoutUnits, treeWithUnits } from '../../../test/trees';
import { ArchiveTree, ArchiveTreeSection, Page } from '../types';
import {
  archiveTreeSectionIsBook,
  archiveTreeSectionIsChapter,
  archiveTreeSectionIsPage,
  archiveTreeSectionIsUnit,
  findArchiveTreeNode,
  findDefaultBookPage,
  getPageSlug,
  splitTitleParts
} from './archiveTreeUtils';

const makeArchiveSection = (title: string): ArchiveTreeSection => ({
  id: `${title}-id`,
  shortId: `${title}-shortid`,
  slug: `${title}-slug`,
  title,
});
const makeArchiveTree = (
  title: string,
  contents: ArchiveTree['contents']
): ArchiveTree => ({
  ...makeArchiveSection(title),
  contents,
});

describe('findDefaultBookPage', () => {
  it('returns first page if there are no chapters', () => {
    const firstPage = makeArchiveSection('page1');
    const testBook: { tree: ArchiveTree } = {
      tree: makeArchiveTree('book', [firstPage, makeArchiveSection('page2')]),
    };

    expect(findDefaultBookPage(testBook)).toBe(firstPage);
  });

  it('returns first page of the first chapter if there are chapters', () => {
    const firstPage = makeArchiveSection('page1');
    const testBook: { tree: ArchiveTree } = {
      tree: makeArchiveTree('book', [
        makeArchiveTree('chapter1', [firstPage, makeArchiveSection('page2')]),
        makeArchiveSection('page3'),
      ]),
    };

    expect(findDefaultBookPage(testBook)).toBe(firstPage);
  });

  it('returns first page of the first nested chapter if there are nested chapters', () => {
    const firstPage = makeArchiveSection('page1');
    const testBook: { tree: ArchiveTree } = {
      tree: makeArchiveTree('book', [
        makeArchiveTree('chapter1', [
          makeArchiveTree('chapter1.1', [
            firstPage,
            makeArchiveSection('page2'),
          ]),
          makeArchiveSection('page3'),
        ]),
        makeArchiveSection('page4'),
      ]),
    };

    expect(findDefaultBookPage(testBook)).toBe(firstPage);
  });
});

describe('splitTitleParts', () => {
  it('returns null when book is not baked', () => {
    expect(splitTitleParts('unbaked-title')).toEqual([null, 'unbaked-title']);
  });
});

describe('tree section identifiers', () => {
  it('identifies the book', () => {
    expect(archiveTreeSectionIsBook(treeWithoutUnits)).toBe(true);
    expect(archiveTreeSectionIsPage(treeWithoutUnits)).toBe(false);
    expect(archiveTreeSectionIsUnit(treeWithoutUnits)).toBe(false);
    expect(archiveTreeSectionIsChapter(treeWithoutUnits)).toBe(false);
  });

  it('identifies the preface', () => {
    const preface = findArchiveTreeNode(treeWithoutUnits, 'preface');

    if (!preface) {
      return expect(preface).toBeTruthy();
    }

    expect(archiveTreeSectionIsBook(preface)).toBe(false);
    expect(archiveTreeSectionIsPage(preface)).toBe(true);
    expect(archiveTreeSectionIsUnit(preface)).toBe(false);
    expect(archiveTreeSectionIsChapter(preface)).toBe(false);
  });

  it('identifies chapters', () => {
    const chapter = findArchiveTreeNode(treeWithoutUnits, 'chapter1');

    if (!chapter) {
      return expect(chapter).toBeTruthy();
    }

    expect(archiveTreeSectionIsBook(chapter)).toBe(false);
    expect(archiveTreeSectionIsPage(chapter)).toBe(false);
    expect(archiveTreeSectionIsUnit(chapter)).toBe(false);
    expect(archiveTreeSectionIsChapter(chapter)).toBe(true);
  });

  it('identifies units', () => {
    const unit = findArchiveTreeNode(treeWithUnits, 'unitid');

    if (!unit) {
      return expect(unit).toBeTruthy();
    }

    expect(archiveTreeSectionIsBook(unit)).toBe(false);
    expect(archiveTreeSectionIsPage(unit)).toBe(false);
    expect(archiveTreeSectionIsUnit(unit)).toBe(true);
    expect(archiveTreeSectionIsChapter(unit)).toBe(false);
  });
});

describe('getPageSlug', () => {
  it('throws when node is not found', () => {
    expect(() =>
      getPageSlug(book, { ...page, id: 'asdf' })
    ).toThrowErrorMatchingInlineSnapshot(
      `"trying to find slug of page, got undefined, pageid: asdf, bookid: testbook1-uuid"`
    );
  });
  it('throws when node is not found', () => {
    expect(() =>
      getPageSlug(book, { id: 'testbook1-testchapter1-uuid' } as Page)
    ).toThrowErrorMatchingInlineSnapshot(
      // tslint:disable-next-line:max-line-length
      `"trying to find slug of page, found node that was not a page, pageid: testbook1-testchapter1-uuid, bookid: testbook1-uuid"`
    );
  });
});
