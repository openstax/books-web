import { SearchResult } from '@openstax/open-search-client/dist/models/SearchResult';
import { SearchResultHit } from '@openstax/open-search-client/dist/models/SearchResultHit';
import { SearchResultHitSourceElementTypeEnum } from '@openstax/open-search-client/dist/models/SearchResultHitSource';
import { treeWithoutUnits, treeWithUnits } from '../../../test/trees';
import { ArchiveTree, ArchiveTreeSection } from '../types';
import { getFirstResultPage, getFormattedSearchResults } from './utils';

const makeSearchResultHit = (tree: ArchiveTree, page: ArchiveTreeSection): SearchResultHit => ({
  highlight: { visibleContent: ['cool <em>highlight</em> bruh'] },
  index: `${tree.id}_i1`,
  score: 2,
  source: {
    elementId: 'fs-id1544727',
    elementType: SearchResultHitSourceElementTypeEnum.Paragraph,
    pageId: page.id,
    pagePosition: 60,
  },
});
const makeSearchResult = (hits: SearchResult['hits']['hits'] = []) => ({
  hits: { hits, total: 0 },
  overallTook: 75,
  shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
  timedOut: false,
  took: 0,
});

describe('getFirstResultPage', () => {
  it('works with empty results', () => {
    const searchResults: SearchResult = makeSearchResult();
    expect(getFirstResultPage({tree: treeWithoutUnits}, searchResults)).toEqual(undefined);
  });

  it('finds chapter page', () => {
    const chapterHit = makeSearchResultHit(treeWithoutUnits, treeWithoutUnits.contents[1].contents![0]);
    const searchResults: SearchResult = makeSearchResult([
      chapterHit,
    ]);

    const result = getFirstResultPage({tree: treeWithoutUnits}, searchResults);

    if (!result) {
      return expect(result).toBeTruthy();
    }

    expect(result.id).toEqual(treeWithoutUnits.contents[1].contents![0].id);
  });
});

describe('getFormattedSearchResults', () => {
  describe('treeWithoutUnits', () => {
    it('works with empty results', () => {
      const searchResults: SearchResult = makeSearchResult(undefined);
      expect(getFormattedSearchResults(treeWithoutUnits, searchResults).length).toBe(0);
    });

    it('preserves chapter structure', () => {
      const chapterHit = makeSearchResultHit(treeWithoutUnits, treeWithoutUnits.contents[1].contents![0]);
      const searchResults: SearchResult = makeSearchResult([
        chapterHit,
      ]);
      expect(getFormattedSearchResults(treeWithoutUnits, searchResults)).toContainEqual(expect.objectContaining({
        contents: [
          expect.objectContaining({
            id: treeWithoutUnits.contents[1].contents![0].id,
            results: [chapterHit],
          }),
        ],
        id: treeWithoutUnits.contents[1].id,
      }));
    });

    it('collapses end of chapter content', () => {
      const chapterHit = makeSearchResultHit(treeWithoutUnits, treeWithoutUnits.contents[1].contents![2].contents![0]);
      const searchResults: SearchResult = makeSearchResult([
        chapterHit,
      ]);
      expect(getFormattedSearchResults(treeWithoutUnits, searchResults)).toContainEqual(expect.objectContaining({
        contents: [
          expect.objectContaining({
            id: treeWithoutUnits.contents[1].contents![2].contents![0].id,
            results: [chapterHit],
          }),
        ],
        id: treeWithoutUnits.contents[1].id,
      }));
    });

    it('preserves end of book content', () => {
      const chapterHit = makeSearchResultHit(treeWithoutUnits, treeWithoutUnits.contents[2]);
      const searchResults: SearchResult = makeSearchResult([
        chapterHit,
      ]);
      expect(getFormattedSearchResults(treeWithoutUnits, searchResults)).toContainEqual(expect.objectContaining({
        id: treeWithoutUnits.contents[2].id,
        results: [chapterHit],
      }));
    });
  });
  describe('treeWithUnits', () => {
    it('collapses unit structure', () => {
      const chapterHit = makeSearchResultHit(treeWithUnits, treeWithUnits.contents[0].contents[1].contents![0]);
      const searchResults: SearchResult = makeSearchResult([
        chapterHit,
      ]);

      expect(getFormattedSearchResults(treeWithUnits, searchResults)).toContainEqual(expect.objectContaining({
        contents: [
          expect.objectContaining({
            id: treeWithUnits.contents[0].contents[1].contents![0].id,
            results: [chapterHit],
          }),
        ],
        id: treeWithUnits.contents[0].contents[1].id,
      }));
    });
  });
});
